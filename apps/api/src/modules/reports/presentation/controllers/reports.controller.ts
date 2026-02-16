import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GenerateReportUseCase } from '../../application/use-cases/generate-report.use-case';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportUseCase: GenerateReportUseCase) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener resumen del dashboard' })
  async getDashboard(@Request() req: any) {
    return this.reportUseCase.getDashboardSummary(req.user.userId);
  }

  @Get('monthly-trend')
  @ApiOperation({ summary: 'Obtener tendencia mensual' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getMonthlyTrend(
    @Request() req: any,
    @Query('months') months?: string,
  ) {
    return this.reportUseCase.getMonthlyTrend(
      req.user.userId,
      months ? parseInt(months, 10) : 12,
    );
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Obtener desglose por categoría' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'EXPENSE'] })
  async getCategoryBreakdown(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type?: string,
  ) {
    return this.reportUseCase.getCategoryBreakdown(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
      type?.toUpperCase(),
    );
  }
}
