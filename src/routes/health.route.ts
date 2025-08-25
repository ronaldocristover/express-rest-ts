import { Router } from 'express';
import { database } from '@/config/database';
import { redisClient } from '@/config/redis';
import { ResponseHandler } from '@/utils/response';
import { asyncHandler } from '@/utils/async-handler';
import { HealthCheckResponse } from '@/types/common';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const startTime = process.hrtime();

    const [databaseStatus, redisStatus] = await Promise.allSettled([
      database.healthCheck(),
      redisClient.healthCheck(),
    ]);

    const dbHealthy = databaseStatus.status === 'fulfilled' && databaseStatus.value;
    const redisHealthy = redisStatus.status === 'fulfilled' && redisStatus.value;

    const isHealthy = dbHealthy && redisHealthy;

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTime = seconds * 1000 + nanoseconds * 1e-6;

    const healthCheck: HealthCheckResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy,
        redis: redisHealthy,
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    const statusCode = isHealthy ? 200 : 503;
    const message = isHealthy ? 'System is healthy' : 'System is unhealthy';

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Response-Time': `${responseTime.toFixed(2)}ms`,
    });

    ResponseHandler.success(res, healthCheck, message, statusCode);
  })
);

export default router;
