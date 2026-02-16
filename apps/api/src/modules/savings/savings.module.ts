import { Module } from '@nestjs/common';
import { SavingsController } from './presentation/controllers/savings.controller';
import { PrismaSavingsGoalRepository } from './infrastructure/repositories/prisma-savings-goal.repository';
import { SAVINGS_GOAL_REPOSITORY } from './domain/repositories/savings-goal.repository.interface';

@Module({
  controllers: [SavingsController],
  providers: [
    {
      provide: SAVINGS_GOAL_REPOSITORY,
      useClass: PrismaSavingsGoalRepository,
    },
  ],
  exports: [SAVINGS_GOAL_REPOSITORY],
})
export class SavingsModule {}
