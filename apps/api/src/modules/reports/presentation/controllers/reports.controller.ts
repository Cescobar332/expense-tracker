import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GenerateReportUseCase } from '../../application/use-cases/generate-report.use-case';
import { AuthenticatedRequest } from '../../../../shared/types/authenticated-request';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportUseCase: GenerateReportUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obtener reporte unificado' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getReport(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // If no dates provided, use all-time range (from year 2000 to 2100)
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    return this.reportUseCase.getUnifiedReport(req.user.userId, start, end);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener resumen del dashboard' })
  async getDashboard(@Request() req: AuthenticatedRequest) {
    return this.reportUseCase.getDashboardSummary(req.user.userId);
  }

  @Get('monthly-trend')
  @ApiOperation({ summary: 'Obtener tendencia mensual' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getMonthlyTrend(
    @Request() req: AuthenticatedRequest,
    @Query('months') months?: string,
  ) {
    return this.reportUseCase.getMonthlyTrend(
      req.user.userId,
      months ? Number.parseInt(months, 10) : 12,
    );
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Obtener desglose por categoría' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'EXPENSE'] })
  async getCategoryBreakdown(
    @Request() req: AuthenticatedRequest,
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
