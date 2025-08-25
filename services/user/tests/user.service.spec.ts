import { UserService } from '../src/service/user.service';
import { UserRepositoryPrisma } from '../src/repository/user.repository';
import { CreateUserRequest, UpdateUserRequest, IUserRepository } from '../src/types/user.types';
import { NotFoundError, ConflictError } from '@/types/errors';
import { user } from '@prisma/client';

const mockUser: user = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  password: 'hashedPassword123',
  is_active: true,
  created_at: new Date('2023-01-01T00:00:00Z'),
  updated_at: new Date('2023-01-01T00:00:00Z'),
  deleted_at: null,
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserData: CreateUserRequest = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserData);

      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserData);
      expect(result).toEqual({
        id: mockUser.id,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email,
        is_active: mockUser.is_active,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('deleted_at');
    });

    it('should throw ConflictError when email already exists', async () => {
      const createUserData: CreateUserRequest = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      mockUserRepository.create.mockRejectedValue(new ConflictError('User with this email already exists'));

      await expect(userService.createUser(createUserData)).rejects.toThrow(ConflictError);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserData);
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: mockUser.id,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email,
        is_active: mockUser.is_active,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
    });

    it('should throw NotFoundError when user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const params = { page: 1, limit: 10 };
      const mockUsers = [mockUser];
      const total = 1;

      mockUserRepository.findMany.mockResolvedValue({ users: mockUsers, total });

      const result = await userService.getUsers(params);

      expect(mockUserRepository.findMany).toHaveBeenCalledWith(params);
      expect(result).toEqual({
        data: [{
          id: mockUser.id,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          email: mockUser.email,
          is_active: mockUser.is_active,
          created_at: mockUser.created_at,
          updated_at: mockUser.updated_at,
        }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      });
    });

    it('should calculate pagination correctly for multiple pages', async () => {
      const params = { page: 2, limit: 5 };
      const mockUsers = [mockUser];
      const total = 12;

      mockUserRepository.findMany.mockResolvedValue({ users: mockUsers, total });

      const result = await userService.getUsers(params);

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        total_pages: 3,
        has_next: true,
        has_prev: true,
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: UpdateUserRequest = {
        first_name: 'Jane',
        email: 'jane.doe@example.com',
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result.first_name).toBe('Jane');
      expect(result.email).toBe('jane.doe@example.com');
    });
  });

  describe('deleteUser', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should soft delete a user by default', async () => {
      mockUserRepository.softDelete.mockResolvedValue();

      await userService.deleteUser(userId);

      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should permanently delete a user when soft is false', async () => {
      mockUserRepository.delete.mockResolvedValue();

      await userService.deleteUser(userId, false);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('activateUser', () => {
    it('should activate a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const activatedUser = { ...mockUser, is_active: true };
      
      mockUserRepository.update.mockResolvedValue(activatedUser);

      const result = await userService.activateUser(userId);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { is_active: true });
      expect(result.is_active).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const deactivatedUser = { ...mockUser, is_active: false };
      
      mockUserRepository.update.mockResolvedValue(deactivatedUser);

      const result = await userService.deactivateUser(userId);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { is_active: false });
      expect(result.is_active).toBe(false);
    });
  });
});