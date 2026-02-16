import { Module } from '@nestjs/common';
import { UsersController } from './presentation/controllers/users.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
