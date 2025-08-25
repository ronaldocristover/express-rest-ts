import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/types/errors';
import { logger } from '@/config/logger';
import { ResponseHandler } from '@/utils/response';
import { env } from '@/config/env';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  if (error instanceof AppError) {
    ResponseHandler.error(res, error.message, error.statusCode);
    return;
  }

  if (error.name === 'ValidationError') {
    ResponseHandler.validationError(res, { validation: [error.message] });
    return;
  }

  if (error.name === 'CastError') {
    ResponseHandler.error(res, 'Invalid data format', 400);
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    ResponseHandler.unauthorized(res, 'Invalid token');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    ResponseHandler.unauthorized(res, 'Token expired');
    return;
  }

  const message = env.NODE_ENV === 'production' ? 'Something went wrong' : error.message;

  ResponseHandler.error(res, message, 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
};
