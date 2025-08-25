import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types/common';

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: PaginatedResponse<T>,
    message: string = 'Success',
    statusCode: number = 200
  ): Response<ApiResponse<PaginatedResponse<T>>> {
    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      error: message,
      errors,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    errors: Record<string, string[]>,
    message: string = 'Validation failed'
  ): Response<ApiResponse> {
    return this.error(res, message, 400, errors);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(
    res: Response,
    message: string = 'Forbidden access'
  ): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): Response<ApiResponse> {
    return this.error(res, message, 409);
  }
}