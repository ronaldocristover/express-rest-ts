import express from 'express';
import compression from 'compression';
import { helmetMiddleware, corsMiddleware, generalRateLimit } from '@/middleware/security';
import { errorHandler, notFoundHandler } from '@/middleware/error-handler';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import { database } from '@/config/database';
import { redisClient } from '@/config/redis';
import routes from '@/routes';

export const createApp = async (): Promise<express.Application> => {
  const app = express();

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(compression() as unknown as express.RequestHandler);
  
  if (env.RATE_LIMIT_ENABLED) {
    logger.info('✅ Rate limiting enabled');
    app.use(generalRateLimit);
  } else {
    logger.warn('⚠️  Rate limiting disabled - not recommended for production');
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use((req, _res, next) => {
    logger.info('Request received', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    next();
  });

  logger.info('📦 Connecting to database...');
  try {
    await database.connect();
    logger.info('✅ Database connection established');
  } catch (error) {
    logger.error('❌ Database connection failed, server cannot start');
    throw error;
  }

  logger.info('🔄 Connecting to Redis cache...');
  try {
    await redisClient.connect();
    logger.info('✅ Redis connection established');
  } catch (error) {
    logger.warn('⚠️  Redis connection failed, continuing without cache', { error });
    logger.info('ℹ️  Application will work without Redis but caching will be disabled');
  }

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
