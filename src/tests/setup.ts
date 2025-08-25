import { database } from '@/config/database';
import { redisClient } from '@/config/redis';
import { logger } from '@/config/logger';

beforeAll(async () => {
  try {
    logger.info('Setting up test environment...');

    await database.connect();

    try {
      await redisClient.connect();
    } catch (error) {
      logger.warn('Redis not available in test environment', { error });
    }

    logger.info('Test environment setup complete');
  } catch (error) {
    logger.error('Test environment setup failed', { error });
    throw error;
  }
});

afterAll(async () => {
  try {
    logger.info('Cleaning up test environment...');

    await database.disconnect();
    await redisClient.disconnect();

    logger.info('Test environment cleanup complete');
  } catch (error) {
    logger.error('Test environment cleanup failed', { error });
  }
});

beforeEach(async () => {
  if (database.isReady()) {
    const client = database.getClient();

    await client.user.deleteMany({});
  }
});
