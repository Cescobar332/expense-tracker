import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }): Promise<User>;
  update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    currency: string;
    isActive: boolean;
  }>): Promise<User>;
}
