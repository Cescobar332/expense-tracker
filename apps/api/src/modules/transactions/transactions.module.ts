import { Module } from '@nestjs/common';
import { TransactionsController } from './presentation/controllers/transactions.controller';
import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/repositories/transaction.repository.interface';

@Module({
  controllers: [TransactionsController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}
