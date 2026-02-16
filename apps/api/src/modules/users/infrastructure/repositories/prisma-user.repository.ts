import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return this.toDomain(user);
  }

  async update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    currency: string;
    isActive: boolean;
  }>): Promise<User> {
    const user = await this.prisma.user.update({ where: { id }, data });
    return this.toDomain(user);
  }

  private toDomain(raw: any): User {
    return new User({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      firstName: raw.firstName,
      lastName: raw.lastName,
      currency: raw.currency,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
