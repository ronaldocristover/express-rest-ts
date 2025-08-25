import { user } from '@prisma/client';

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active?: boolean;
}

export interface UserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  sort_by?: keyof user;
  sort_order?: 'asc' | 'desc';
  q?: string;
}

export interface IUserRepository {
  create(data: CreateUserRequest): Promise<user>;
  findById(id: string): Promise<user | null>;
  findByEmail(email: string): Promise<user | null>;
  findMany(params: UserSearchParams): Promise<{ users: user[]; total: number }>;
  update(id: string, data: UpdateUserRequest): Promise<user>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}