import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { ResponseHandler } from '@/utils/response';
import { Request, Response } from 'express';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

const createRateLimitHandler = (message: string) => {
  return (_req: Request, res: Response) => {
    ResponseHandler.error(res, message, 429);
  };
};

export const generalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  handler: createRateLimitHandler('Too many requests from this IP, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.floor(env.RATE_LIMIT_MAX_REQUESTS * 0.8),
  message: 'Too many API requests from this IP, please try again later',
  handler: createRateLimitHandler('Too many API requests from this IP, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.floor(env.RATE_LIMIT_MAX_REQUESTS * 0.2),
  message: 'Too many authentication attempts from this IP, please try again later',
  handler: createRateLimitHandler(
    'Too many authentication attempts from this IP, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
});
