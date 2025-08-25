import request from 'supertest';
import express from 'express';
import { UserController } from '../src/controller/user.controller';
import { UserService } from '../src/service/user.service';
import { validate } from '@/middleware/validation';
import { errorHandler } from '@/middleware/error-handler';
import { CreateUserSchema, UpdateUserSchema, UserParamsSchema } from '../src/validation/user.validation';
import { NotFoundError, ConflictError } from '@/types/errors';

jest.mock('../src/service/user.service');

const mockUserService = {
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUsers: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  activateUser: jest.fn(),
  deactivateUser: jest.fn(),
} as jest.Mocked<UserService>;

describe('UserController', () => {
  let app: express.Application;
  let userController: UserController;

  beforeEach(() => {
    userController = new UserController(mockUserService);
    app = express();
    
    app.use(express.json());
    
    app.post('/users', validate({ body: CreateUserSchema }), userController.createUser);
    app.get('/users/:id', validate({ params: UserParamsSchema }), userController.getUserById);
    app.get('/users', userController.getUsers);
    app.put('/users/:id', validate({ params: UserParamsSchema, body: UpdateUserSchema }), userController.updateUser);
    app.delete('/users/:id', validate({ params: UserParamsSchema }), userController.deleteUser);
    app.patch('/users/:id/activate', validate({ params: UserParamsSchema }), userController.activateUser);
    app.patch('/users/:id/deactivate', validate({ params: UserParamsSchema }), userController.deactivateUser);
    
    app.use(errorHandler);
    
    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    it('should create a user successfully', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };

      const mockResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.createUser.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User created successfully',
        data: mockResponse,
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
    });

    it('should return validation error for invalid data', async () => {
      const invalidUserData = {
        first_name: '',
        last_name: 'Doe',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/users')
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it('should return conflict error when email already exists', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };

      mockUserService.createUser.mockRejectedValue(new ConflictError('User with this email already exists'));

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User with this email already exists',
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should get a user by ID successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.getUserById.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User retrieved successfully',
        data: mockResponse,
      });
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should return not found error when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      
      mockUserService.getUserById.mockRejectedValue(new NotFoundError('User not found'));

      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User not found',
      });
    });

    it('should return validation error for invalid UUID', async () => {
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .get(`/users/${invalidId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('GET /users', () => {
    it('should get paginated users successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      };

      mockUserService.getUsers.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Users retrieved successfully',
        data: mockResponse,
      });
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        first_name: 'Jane',
        email: 'jane.doe@example.com'
      };

      const mockResponse = {
        id: userId,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.updateUser.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User updated successfully',
        data: mockResponse,
      });
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete a user by default', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockUserService.deleteUser.mockResolvedValue();

      const response = await request(app)
        .delete(`/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User deactivated successfully',
        data: null,
      });
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId, true);
    });

    it('should permanently delete when permanent=true', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockUserService.deleteUser.mockResolvedValue();

      const response = await request(app)
        .delete(`/users/${userId}?permanent=true`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User deleted permanently',
        data: null,
      });
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId, false);
    });
  });

  describe('PATCH /users/:id/activate', () => {
    it('should activate a user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserService.activateUser.mockResolvedValue(mockResponse);

      const response = await request(app)
        .patch(`/users/${userId}/activate`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User activated successfully',
        data: mockResponse,
      });
      expect(mockUserService.activateUser).toHaveBeenCalledWith(userId);
    });
  });
});