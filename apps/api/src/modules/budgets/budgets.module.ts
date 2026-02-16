import { Module } from '@nestjs/common';
import { BudgetsController } from './presentation/controllers/budgets.controller';
import { PrismaBudgetRepository } from './infrastructure/repositories/prisma-budget.repository';
import { BUDGET_REPOSITORY } from './domain/repositories/budget.repository.interface';

@Module({
  controllers: [BudgetsController],
  providers: [
    {
      provide: BUDGET_REPOSITORY,
      useClass: PrismaBudgetRepository,
    },
  ],
  exports: [BUDGET_REPOSITORY],
})
export class BudgetsModule {}
