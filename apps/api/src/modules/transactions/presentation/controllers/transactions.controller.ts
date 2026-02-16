import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, ForbiddenException, NotFoundException, Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { TRANSACTION_REPOSITORY, ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../application/dto/update-transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepo: ITransactionRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar transacciones con filtros y paginación' })
  @ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'EXPENSE'] })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionRepo.findByFilters({
      userId: req.user.userId,
      type: type?.toUpperCase(),
      categoryId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen financiero por rango de fechas' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getSummary(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionRepo.getSummaryByDateRange(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Obtener totales por categoría' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getByCategory(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionRepo.getByCategory(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una transacción' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const tx = await this.transactionRepo.findById(id);
    if (!tx) throw new NotFoundException('Transacción no encontrada');
    if (tx.userId !== req.user.userId) throw new ForbiddenException();
    return tx;
  }

  @Post()
  @ApiOperation({ summary: 'Crear transacción' })
  async create(@Request() req: any, @Body() dto: CreateTransactionDto) {
    return this.transactionRepo.create({
      userId: req.user.userId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      type: dto.type,
      description: dto.description,
      date: new Date(dto.date),
      isRecurring: dto.isRecurring,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar transacción' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const tx = await this.transactionRepo.findById(id);
    if (!tx) throw new NotFoundException('Transacción no encontrada');
    if (tx.userId !== req.user.userId) throw new ForbiddenException();
    const updateData: any = { ...dto };
    if (dto.date) updateData.date = new Date(dto.date);
    return this.transactionRepo.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar transacción' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const tx = await this.transactionRepo.findById(id);
    if (!tx) throw new NotFoundException('Transacción no encontrada');
    if (tx.userId !== req.user.userId) throw new ForbiddenException();
    await this.transactionRepo.delete(id);
    return { message: 'Transacción eliminada' };
  }
}
