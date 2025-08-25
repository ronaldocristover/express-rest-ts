import { user } from '@prisma/client';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserSearchParams, 
  UserResponse,
  IUserRepository
} from '../types/user.types';
import { PaginatedResponse } from '@/types/common';
import { UserRepositoryPrisma } from '../repository/user.repository';
import { NotFoundError } from '@/types/errors';
import { logger } from '@/config/logger';

export class UserService {
  constructor(private userRepository: IUserRepository = new UserRepositoryPrisma()) {}

  private mapUserToResponse(user: user): UserResponse {
    const { password, deleted_at, ...userResponse } = user;
    return userResponse as UserResponse;
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    logger.info('Creating new user', { email: data.email });
    
    const user = await this.userRepository.create(data);
    
    logger.info('User created successfully', { 
      userId: user.id, 
      email: user.email 
    });
    
    return this.mapUserToResponse(user);
  }

  async getUserById(id: string): Promise<UserResponse> {
    logger.debug('Getting user by ID', { userId: id });
    
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.mapUserToResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    logger.debug('Getting user by email', { email });
    
    const user = await this.userRepository.findByEmail(email);
    
    return user ? this.mapUserToResponse(user) : null;
  }

  async getUsers(params: UserSearchParams): Promise<PaginatedResponse<UserResponse>> {
    logger.info('Getting users list', { params });
    
    const { page = 1, limit = 10 } = params;
    
    const { users, total } = await this.userRepository.findMany(params);
    
    const data = users.map(user => this.mapUserToResponse(user));
    
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.info('Users retrieved successfully', { 
      count: data.length, 
      total, 
      page, 
      totalPages 
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: hasNext,
        has_prev: hasPrev,
      },
    };
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    logger.info('Updating user', { userId: id, updateFields: Object.keys(data) });
    
    const updatedUser = await this.userRepository.update(id, data);
    
    logger.info('User updated successfully', { userId: id });
    
    return this.mapUserToResponse(updatedUser);
  }

  async deleteUser(id: string, soft: boolean = true): Promise<void> {
    logger.info('Deleting user', { userId: id, soft });
    
    if (soft) {
      await this.userRepository.softDelete(id);
      logger.info('User soft deleted successfully', { userId: id });
    } else {
      await this.userRepository.delete(id);
      logger.info('User permanently deleted', { userId: id });
    }
  }

  async searchUsers(query: string, params: UserSearchParams): Promise<PaginatedResponse<UserResponse>> {
    logger.info('Searching users', { query, params });
    
    const searchParams = { ...params, q: query };
    return this.getUsers(searchParams);
  }

  async activateUser(id: string): Promise<UserResponse> {
    logger.info('Activating user', { userId: id });
    
    const updatedUser = await this.userRepository.update(id, { is_active: true });
    
    logger.info('User activated successfully', { userId: id });
    
    return this.mapUserToResponse(updatedUser);
  }

  async deactivateUser(id: string): Promise<UserResponse> {
    logger.info('Deactivating user', { userId: id });
    
    const updatedUser = await this.userRepository.update(id, { is_active: false });
    
    logger.info('User deactivated successfully', { userId: id });
    
    return this.mapUserToResponse(updatedUser);
  }
}