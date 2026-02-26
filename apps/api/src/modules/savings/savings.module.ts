import { Module } from '@nestjs/common';
import { SavingsController } from './presentation/controllers/savings.controller';
import { PrismaSavingsGoalRepository } from './infrastructure/repositories/prisma-savings-goal.repository';
import { SAVINGS_GOAL_REPOSITORY } from './domain/repositories/savings-goal.repository.interface';
import { AddSavingsAmountUseCase } from './application/use-cases/add-savings-amount.use-case';
import { PrismaService } from '../../shared/infrastructure/prisma.service';

@Module({
  controllers: [SavingsController],
  providers: [
    {
      provide: SAVINGS_GOAL_REPOSITORY,
      useClass: PrismaSavingsGoalRepository,
    },
    AddSavingsAmountUseCase,
    PrismaService,
  ],
  exports: [SAVINGS_GOAL_REPOSITORY],
})
export class SavingsModule {}
