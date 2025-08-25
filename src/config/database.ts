import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { env } from './env';

class Database {
  private prisma: PrismaClient | null = null;
  private isConnected = false;

  async connect(): Promise<PrismaClient> {
    if (this.prisma && this.isConnected) {
      return this.prisma;
    }

    logger.info('Attempting to connect to database...', {
      databaseUrl: this.maskDatabaseUrl(env.DATABASE_URL),
      nodeEnv: env.NODE_ENV,
    });

    try {
      this.prisma = new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      logger.debug('Prisma client created, attempting connection...');
      await this.prisma.$connect();
      logger.debug('Prisma connection established');

      logger.debug('Running database health check...');
      const healthCheckPassed = await this.healthCheck();

      if (!healthCheckPassed) {
        throw new Error('Database health check failed');
      }

      this.isConnected = true;
      logger.info('Database connected successfully', {
        databaseUrl: this.maskDatabaseUrl(env.DATABASE_URL),
      });

      return this.prisma;
    } catch (error) {
      this.isConnected = false;
      this.prisma = null;

      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        sqlState: (error as any)?.sqlState,
        databaseUrl: this.maskDatabaseUrl(env.DATABASE_URL),
        nodeEnv: env.NODE_ENV,
      };

      logger.error('❌ Database connection failed', errorDetails);

      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          logger.error('🔌 Connection refused: Database server is not running or not accessible');
        } else if (error.message.includes('ENOTFOUND')) {
          logger.error('🌐 Host not found: Check database host in DATABASE_URL');
        } else if (error.message.includes('Access denied')) {
          logger.error('🔐 Access denied: Check database credentials in DATABASE_URL');
        } else if (error.message.includes('Unknown database')) {
          logger.error('💾 Database not found: Check database name in DATABASE_URL');
        } else if (error.message.includes('timeout')) {
          logger.error('⏰ Connection timeout: Database server is not responding');
        }
      }

      logger.error('💡 Troubleshooting tips:');
      logger.error('   1. Verify DATABASE_URL is correct');
      logger.error('   2. Ensure database server is running');
      logger.error('   3. Check network connectivity');
      logger.error('   4. Verify database credentials');
      logger.error('   5. Ensure database exists');

      throw error;
    }
  }

  private maskDatabaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.password) {
        urlObj.password = '***';
      }
      if (urlObj.username && urlObj.username !== 'root') {
        urlObj.username = urlObj.username.slice(0, 2) + '***';
      }
      return urlObj.toString();
    } catch {
      return 'invalid-url';
    }
  }

  async disconnect(): Promise<void> {
    if (this.prisma && this.isConnected) {
      await this.prisma.$disconnect();
      this.prisma = null;
      this.isConnected = false;
      logger.info('Database disconnected');
    }
  }

  getClient(): PrismaClient {
    if (!this.prisma || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.prisma;
  }

  isReady(): boolean {
    return this.isConnected && this.prisma !== null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.prisma) {
        return false;
      }

      await this.prisma.$queryRaw`SELECT 1`;
      logger.debug('Database health check passed');
      return true;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }
}

export const database = new Database();
