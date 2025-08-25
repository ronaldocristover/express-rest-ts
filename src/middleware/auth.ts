import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { ResponseHandler } from '@/utils/response';
import { UnauthorizedError, ValidationError } from '@/types/errors';

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Middleware to handle Basic Authentication
 * Expects Authorization header with format: "Basic base64(username:password)"
 */
export const basicAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Missing Authorization header');
    }

    if (!authHeader.startsWith('Basic ')) {
      throw new UnauthorizedError('Invalid authorization format. Expected Basic authentication');
    }

    const base64Credentials = authHeader.split(' ')[1];
    if (!base64Credentials) {
      throw new UnauthorizedError('Missing credentials in Basic authentication');
    }

    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    // Add decoded credentials to request object for further processing
    req.user = {
      username,
      password,
      authType: 'basic'
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ValidationError) {
      ResponseHandler.error(res, error.message, error.statusCode);
      return;
    }
    ResponseHandler.error(res, 'Authentication failed', 401);
  }
};

/**
 * Middleware to handle Bearer Token Authentication
 * Expects Authorization header with format: "Bearer <jwt_token>"
 */
export const bearerAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Missing Authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Invalid authorization format. Expected Bearer token');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Missing token in Bearer authentication');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Add decoded token payload to request object
    req.user = {
      ...(decoded as object),
      authType: 'bearer'
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      ResponseHandler.error(res, 'Invalid token', 401);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      ResponseHandler.error(res, 'Token expired', 401);
      return;
    }
    if (error instanceof UnauthorizedError) {
      ResponseHandler.error(res, error.message, error.statusCode);
      return;
    }
    ResponseHandler.error(res, 'Authentication failed', 401);
  }
};

/**
 * Flexible authentication middleware that accepts both Basic and Bearer authentication
 * Tries Bearer first, falls back to Basic if Bearer is not present
 */
export const flexibleAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    ResponseHandler.error(res, 'Missing Authorization header', 401);
    return;
  }

  if (authHeader.startsWith('Bearer ')) {
    bearerAuthMiddleware(req, res, next);
    return;
  } else if (authHeader.startsWith('Basic ')) {
    basicAuthMiddleware(req, res, next);
    return;
  } else {
    ResponseHandler.error(res, 'Invalid authorization format. Expected Basic or Bearer authentication', 401);
    return;
  }
};

/**
 * Optional authentication middleware - allows requests with or without authentication
 * If authentication is provided, it validates and attaches user info to request
 */
export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // No authentication provided, continue without setting user
    next();
    return;
  }

  // Authentication provided, validate it
  flexibleAuthMiddleware(req, res, next);
};