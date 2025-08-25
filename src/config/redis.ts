import { createClient, RedisClientType } from 'redis';
import { env } from './env';

class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<RedisClientType> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      const passwordPart = env.REDIS_PASSWORD ? `:${env.REDIS_PASSWORD}@` : '';
      const redisUrl = env.REDIS_URL || 
        `redis://${passwordPart}${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`;

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: env.REDIS_CONNECT_TIMEOUT,
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  getClient(): RedisClientType | null {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isReady()) {
        return false;
      }
      
      const result = await this.client!.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isReady()) {
      console.warn('Redis not available, skipping set operation');
      return;
    }

    try {
      if (ttl) {
        await this.client!.setEx(key, ttl, value);
      } else {
        await this.client!.set(key, value);
      }
    } catch (error) {
      console.error('Redis set operation failed:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady()) {
      console.warn('Redis not available, skipping get operation');
      return null;
    }

    try {
      return await this.client!.get(key);
    } catch (error) {
      console.error('Redis get operation failed:', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isReady()) {
      console.warn('Redis not available, skipping delete operation');
      return;
    }

    try {
      await this.client!.del(key);
    } catch (error) {
      console.error('Redis delete operation failed:', error);
    }
  }
}

export const redisClient = new RedisClient();