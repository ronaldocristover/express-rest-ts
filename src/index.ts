import 'module-alias/register';
import { createApp } from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { database } from '@/config/database';
import { redisClient } from '@/config/redis';

const startServer = async (): Promise<void> => {
  try {
    logger.info('🚀 Starting server...', { 
      nodeEnv: env.NODE_ENV, 
      port: env.PORT,
      host: env.HOST,
      apiVersion: env.API_VERSION,
    });

    logger.info('🔧 Initializing application services...');
    const app = await createApp();

    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`✅ Server is running on http://${env.HOST}:${env.PORT}`, {
        environment: env.NODE_ENV,
        apiVersion: env.API_VERSION,
        healthCheck: `http://${env.HOST}:${env.PORT}/api/${env.API_VERSION}/health`,
      });
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await database.disconnect();
          await redisClient.disconnect();
          logger.info('Database and Redis connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', { error });
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Graceful shutdown timeout, forcing exit');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      process.exit(1);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error });
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    
    if (error instanceof Error) {
      if (error.message.includes('Database connection failed') || 
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND')) {
        logger.error('🔌 Server startup failed due to database connection issues');
        logger.error('💡 Please ensure your database is running and accessible');
      }
    }
    
    process.exit(1);
  }
};

startServer();