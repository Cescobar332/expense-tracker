import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { databaseConfig, jwtConfig, appConfig } from './config/env.config';
import { PrismaModule } from './shared/infrastructure/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { SavingsModule } from './modules/savings/savings.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    SavingsModule,
    ReportsModule,
  ],
})
export class AppModule {}
