import { Module } from '@nestjs/common';
import { ReportsController } from './presentation/controllers/reports.controller';
import { GenerateReportUseCase } from './application/use-cases/generate-report.use-case';

@Module({
  controllers: [ReportsController],
  providers: [GenerateReportUseCase],
})
export class ReportsModule {}
