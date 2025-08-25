import { user, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { database } from '@/config/database';
import { redisClient } from '@/config/redis';
import { logger } from '@/config/logger';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserSearchParams, 
  IUserRepository 
} from '../types/user.types';
import { 
  NotFoundError, 
  ConflictError, 
  DatabaseError 
} from '@/types/errors';

export class UserRepositoryPrisma implements IUserRepository {
  private readonly CACHE_PREFIX = 'user';
  private readonly CACHE_TTL = 3600;

  private getCacheKey(identifier: string, type: 'id' | 'email' = 'id'): string {
    return `${this.CACHE_PREFIX}:${type}:${identifier}`;
  }

  private async setCacheUser(user: user): Promise<void> {
    if (!redisClient.isReady()) return;

    const userData = JSON.stringify(user);
    await Promise.allSettled([
      redisClient.set(this.getCacheKey(user.id), userData, this.CACHE_TTL),
      redisClient.set(this.getCacheKey(user.email, 'email'), userData, this.CACHE_TTL)
    ]);
  }

  private async getCacheUser(identifier: string, type: 'id' | 'email' = 'id'): Promise<user | null> {
    if (!redisClient.isReady()) return null;

    try {
      const cached = await redisClient.get(this.getCacheKey(identifier, type));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Cache get operation failed', { identifier, type, error });
      return null;
    }
  }

  private async invalidateCacheUser(user: user): Promise<void> {
    if (!redisClient.isReady()) return;

    await Promise.allSettled([
      redisClient.del(this.getCacheKey(user.id)),
      redisClient.del(this.getCacheKey(user.email, 'email'))
    ]);
  }

  async create(data: CreateUserRequest): Promise<user> {
    try {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      const user = await database.getClient().user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      await this.setCacheUser(user);

      logger.info('User created successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      if (error instanceof ConflictError) throw error;
      
      logger.error('Failed to create user', { error, email: data.email });
      throw new DatabaseError('Failed to create user');
    }
  }

  async findById(id: string): Promise<user | null> {
    try {
      const cached = await this.getCacheUser(id);
      if (cached) {
        logger.debug('User found in cache', { userId: id });
        return cached;
      }

      const user = await database.getClient().user.findUnique({
        where: { 
          id,
          deleted_at: null 
        },
      });

      if (user) {
        await this.setCacheUser(user);
        logger.debug('User found in database and cached', { userId: id });
      }

      return user;
    } catch (error) {
      logger.error('Failed to find user by ID', { error, userId: id });
      throw new DatabaseError('Failed to find user');
    }
  }

  async findByEmail(email: string): Promise<user | null> {
    try {
      const cached = await this.getCacheUser(email, 'email');
      if (cached) {
        logger.debug('User found in cache by email', { email });
        return cached;
      }

      const user = await database.getClient().user.findUnique({
        where: { 
          email,
          deleted_at: null 
        },
      });

      if (user) {
        await this.setCacheUser(user);
        logger.debug('User found in database by email and cached', { email });
      }

      return user;
    } catch (error) {
      logger.error('Failed to find user by email', { error, email });
      throw new DatabaseError('Failed to find user');
    }
  }

  async findMany(params: UserSearchParams): Promise<{ users: user[]; total: number }> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort_by = 'created_at', 
        sort_order = 'desc',
        q 
      } = params;

      const skip = (page - 1) * limit;
      
      const where: Prisma.userWhereInput = {
        deleted_at: null,
        ...(q && {
          OR: [
            { first_name: { contains: q } },
            { last_name: { contains: q } },
            { email: { contains: q } },
          ],
        }),
      };

      const orderBy: Prisma.userOrderByWithRelationInput = {
        [sort_by]: sort_order,
      };

      const [users, total] = await Promise.all([
        database.getClient().user.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        database.getClient().user.count({ where }),
      ]);

      logger.debug('Users retrieved successfully', { 
        count: users.length, 
        total, 
        page, 
        limit 
      });

      return { users, total };
    } catch (error) {
      logger.error('Failed to find users', { error, params });
      throw new DatabaseError('Failed to find users');
    }
  }

  async update(id: string, data: UpdateUserRequest): Promise<user> {
    try {
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      if (data.email && data.email !== existingUser.email) {
        const userWithEmail = await this.findByEmail(data.email);
        if (userWithEmail) {
          throw new ConflictError('User with this email already exists');
        }
      }

      await this.invalidateCacheUser(existingUser);

      const updatedUser = await database.getClient().user.update({
        where: { id },
        data,
      });

      await this.setCacheUser(updatedUser);

      logger.info('User updated successfully', { userId: id });
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Failed to update user', { error, userId: id });
      throw new DatabaseError('Failed to update user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await this.invalidateCacheUser(user);

      await database.getClient().user.delete({
        where: { id },
      });

      logger.info('User permanently deleted', { userId: id });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      
      logger.error('Failed to delete user', { error, userId: id });
      throw new DatabaseError('Failed to delete user');
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await this.invalidateCacheUser(user);

      await database.getClient().user.update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      logger.info('User soft deleted', { userId: id });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      
      logger.error('Failed to soft delete user', { error, userId: id });
      throw new DatabaseError('Failed to soft delete user');
    }
  }
}