import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import {
  BUDGET_REPOSITORY,
  IBudgetRepository,
} from '../../domain/repositories/budget.repository.interface';
import { CreateBudgetDto } from '../../application/dto/create-budget.dto';
import { UpdateBudgetDto } from '../../application/dto/update-budget.dto';
import { AuthenticatedRequest } from '../../../../shared/types/authenticated-request';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepo: IBudgetRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar presupuestos con gasto actual' })
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.budgetRepo.getBudgetsWithSpent(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un presupuesto' })
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const budget = await this.budgetRepo.findById(id);
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    if (budget.userId !== req.user.userId) throw new ForbiddenException();
    return budget;
  }

  @Post()
  @ApiOperation({ summary: 'Crear presupuesto' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgetRepo.create({
      userId: req.user.userId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      period: dto.period,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      alertAt: dto.alertAt,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar presupuesto' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    const budget = await this.budgetRepo.findById(id);
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    if (budget.userId !== req.user.userId) throw new ForbiddenException();
    const { startDate, endDate, ...rest } = dto;
    return this.budgetRepo.update(id, {
      ...rest,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar presupuesto' })
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const budget = await this.budgetRepo.findById(id);
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    if (budget.userId !== req.user.userId) throw new ForbiddenException();
    await this.budgetRepo.delete(id);
    return { message: 'Presupuesto eliminado' };
  }
}
