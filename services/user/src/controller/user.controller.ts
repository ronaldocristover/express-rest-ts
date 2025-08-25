import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { ResponseHandler } from '@/utils/response';
import { asyncHandler } from '@/utils/async-handler';
import { logger } from '@/config/logger';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserSearchParams 
} from '../types/user.types';

export class UserController {
  constructor(private userService: UserService = new UserService()) {}

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserRequest = req.body;
    
    logger.info('Create user request received', { 
      email: userData.email,
      ip: req.ip 
    });

    const user = await this.userService.createUser(userData);

    ResponseHandler.success(
      res, 
      user, 
      'User created successfully', 
      201
    );
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    logger.debug('Get user by ID request received', { 
      userId: id,
      ip: req.ip 
    });

    const user = await this.userService.getUserById(id);

    ResponseHandler.success(
      res, 
      user, 
      'User retrieved successfully'
    );
  });

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const params: UserSearchParams = req.query;
    
    logger.info('Get users list request received', { 
      params,
      ip: req.ip 
    });

    const result = await this.userService.getUsers(params);

    ResponseHandler.paginated(
      res, 
      result, 
      'Users retrieved successfully'
    );
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateUserRequest = req.body;
    
    logger.info('Update user request received', { 
      userId: id,
      updateFields: Object.keys(updateData),
      ip: req.ip 
    });

    const user = await this.userService.updateUser(id, updateData);

    ResponseHandler.success(
      res, 
      user, 
      'User updated successfully'
    );
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permanent } = req.query;
    
    const soft = permanent !== 'true';
    
    logger.info('Delete user request received', { 
      userId: id,
      soft,
      ip: req.ip 
    });

    await this.userService.deleteUser(id, soft);

    ResponseHandler.success(
      res, 
      null, 
      soft ? 'User deactivated successfully' : 'User deleted permanently'
    );
  });

  searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q: query } = req.query as { q: string };
    const params: UserSearchParams = req.query;
    
    logger.info('Search users request received', { 
      query,
      params,
      ip: req.ip 
    });

    const result = await this.userService.searchUsers(query, params);

    ResponseHandler.paginated(
      res, 
      result, 
      'Search completed successfully'
    );
  });

  activateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    logger.info('Activate user request received', { 
      userId: id,
      ip: req.ip 
    });

    const user = await this.userService.activateUser(id);

    ResponseHandler.success(
      res, 
      user, 
      'User activated successfully'
    );
  });

  deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    logger.info('Deactivate user request received', { 
      userId: id,
      ip: req.ip 
    });

    const user = await this.userService.deactivateUser(id);

    ResponseHandler.success(
      res, 
      user, 
      'User deactivated successfully'
    );
  });
}