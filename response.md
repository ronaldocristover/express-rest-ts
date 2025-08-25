# API Response Documentation

This file provides comprehensive response format documentation for all API endpoints.

## Base Response Structure

All API responses follow a consistent structure with the following fields:
- `success`: Boolean indicating if the request was successful
- `message`: Human-readable message describing the result
- `data`: The actual response data (null for errors)
- `timestamp`: ISO 8601 timestamp of the response
- `error`: Error message (only present on failures)
- `errors`: Validation errors object (only present on validation failures)

---

## Health Check API

### GET `/api/v1/health`

**Success Response (200)**
```json
{
  "success": true,
  "message": "System is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2023-12-01T10:00:00.000Z",
    "services": {
      "database": true,
      "redis": true
    },
    "uptime": 3600,
    "version": "1.0.0"
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

**Unhealthy Response (503)**
```json
{
  "success": false,
  "message": "System is unhealthy",
  "data": {
    "status": "unhealthy",
    "timestamp": "2023-12-01T10:00:00.000Z",
    "services": {
      "database": false,
      "redis": true
    },
    "uptime": 3600,
    "version": "1.0.0"
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

---

## User Management API

### GET `/api/v1/users` - Get All Users (Paginated)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort_by` (optional): Sort field (default: created_at)
- `sort_order` (optional): Sort direction - asc|desc (default: desc)
- `q` (optional): Search query (searches first_name, last_name, email)

**Success Response (200)**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "is_active": true,
        "created_at": "2023-12-01T10:00:00.000Z",
        "updated_at": "2023-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### GET `/api/v1/users/search` - Search Users

**Query Parameters:** Same as GET `/api/v1/users` plus:
- `q` (required): Search query

**Success Response (200)** - Same format as GET `/api/v1/users`

### GET `/api/v1/users/:id` - Get User by ID

**Success Response (200)**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "is_active": true,
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:00.000Z"
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

**Not Found Response (404)**
```json
{
  "success": false,
  "message": "User not found",
  "error": "User not found",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### POST `/api/v1/users` - Create New User

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Success Response (201)**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "is_active": true,
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:00.000Z"
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

**Validation Error Response (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"],
    "first_name": ["First name is required"]
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

**Conflict Error Response (409)**
```json
{
  "success": false,
  "message": "User with this email already exists",
  "error": "User with this email already exists",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### PUT `/api/v1/users/:id` - Update User

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "is_active": false
}
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "is_active": false,
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:01.000Z"
  },
  "timestamp": "2023-12-01T10:00:01.000Z"
}
```

### PATCH `/api/v1/users/:id/activate` - Activate User

**Success Response (200)**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "is_active": true,
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:01.000Z"
  },
  "timestamp": "2023-12-01T10:00:01.000Z"
}
```

### PATCH `/api/v1/users/:id/deactivate` - Deactivate User

**Success Response (200)**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "is_active": false,
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:01.000Z"
  },
  "timestamp": "2023-12-01T10:00:01.000Z"
}
```

### DELETE `/api/v1/users/:id` - Delete User (Soft Delete)

**Success Response (200)**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": null,
  "timestamp": "2023-12-01T10:00:01.000Z"
}
```

### DELETE `/api/v1/users/:id?permanent=true` - Permanently Delete User

**Success Response (200)**
```json
{
  "success": true,
  "message": "User deleted permanently",
  "data": null,
  "timestamp": "2023-12-01T10:00:01.000Z"
}
```

---

## Common Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid request",
  "error": "Invalid request",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access",
  "error": "Unauthorized access",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Forbidden access",
  "error": "Forbidden access",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Resource not found",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Resource conflict",
  "error": "Resource conflict",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### 429 - Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later",
  "error": "Too many requests from this IP, please try again later",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Internal Server Error",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

---

## Response Headers

All responses include these headers:
- `Content-Type: application/json`
- `X-Response-Time: {time}ms` (for health check endpoint)
- Security headers via Helmet middleware
- Rate limiting headers when applicable

---

## Notes

1. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
2. **UUIDs**: All IDs use UUID v4 format
3. **Passwords**: Never included in any response
4. **Soft Delete**: Deleted users have `deleted_at` timestamp but are excluded from responses
5. **Pagination**: Maximum limit is 100 items per page
6. **Search**: Case-insensitive search across first_name, last_name, and email fields
7. **Validation**: Detailed validation errors are provided for all input validation failures
