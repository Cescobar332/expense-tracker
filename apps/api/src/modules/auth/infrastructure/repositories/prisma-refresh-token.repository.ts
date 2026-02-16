import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; token: string; expiresAt: Date }): Promise<void> {
    await this.prisma.refreshToken.create({ data });
  }

  async findByToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { token } }).catch(() => {});
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
