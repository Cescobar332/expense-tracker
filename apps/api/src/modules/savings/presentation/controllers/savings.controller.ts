import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Request, ForbiddenException, NotFoundException, Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { SAVINGS_GOAL_REPOSITORY, ISavingsGoalRepository } from '../../domain/repositories/savings-goal.repository.interface';
import { CreateSavingsGoalDto } from '../../application/dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from '../../application/dto/update-savings-goal.dto';
import { AddSavingsAmountDto } from '../../application/dto/add-savings-amount.dto';

@ApiTags('savings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('savings')
export class SavingsController {
  constructor(
    @Inject(SAVINGS_GOAL_REPOSITORY) private readonly savingsRepo: ISavingsGoalRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar metas de ahorro' })
  async findAll(@Request() req: any) {
    const goals = await this.savingsRepo.findByUserId(req.user.userId);
    return goals.map((g) => ({ ...g, progress: g.progress }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una meta de ahorro' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const goal = await this.savingsRepo.findById(id);
    if (!goal) throw new NotFoundException('Meta de ahorro no encontrada');
    if (goal.userId !== req.user.userId) throw new ForbiddenException();
    return { ...goal, progress: goal.progress };
  }

  @Post()
  @ApiOperation({ summary: 'Crear meta de ahorro' })
  async create(@Request() req: any, @Body() dto: CreateSavingsGoalDto) {
    return this.savingsRepo.create({
      userId: req.user.userId,
      name: dto.name,
      targetAmount: dto.targetAmount,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar meta de ahorro' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ) {
    const goal = await this.savingsRepo.findById(id);
    if (!goal) throw new NotFoundException('Meta de ahorro no encontrada');
    if (goal.userId !== req.user.userId) throw new ForbiddenException();
    const updateData: any = { ...dto };
    if (dto.targetDate) updateData.targetDate = new Date(dto.targetDate);
    return this.savingsRepo.update(id, updateData);
  }

  @Post(':id/add')
  @ApiOperation({ summary: 'Agregar o retirar monto de la meta' })
  async addAmount(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddSavingsAmountDto,
  ) {
    const goal = await this.savingsRepo.findById(id);
    if (!goal) throw new NotFoundException('Meta de ahorro no encontrada');
    if (goal.userId !== req.user.userId) throw new ForbiddenException();
    const updated = await this.savingsRepo.addAmount(id, dto.amount);
    return { ...updated, progress: updated.progress };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar meta de ahorro' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const goal = await this.savingsRepo.findById(id);
    if (!goal) throw new NotFoundException('Meta de ahorro no encontrada');
    if (goal.userId !== req.user.userId) throw new ForbiddenException();
    await this.savingsRepo.delete(id);
    return { message: 'Meta de ahorro eliminada' };
  }
}
