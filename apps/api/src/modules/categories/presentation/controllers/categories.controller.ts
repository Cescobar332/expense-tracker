import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Request, Query, ForbiddenException, NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CATEGORY_REPOSITORY, ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CreateCategoryDto } from '../../application/dto/create-category.dto';
import { UpdateCategoryDto } from '../../application/dto/update-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepo: ICategoryRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías del usuario' })
  async findAll(@Request() req: any, @Query('type') type?: string) {
    if (type) {
      return this.categoryRepo.findByUserIdAndType(req.user.userId, type.toUpperCase());
    }
    return this.categoryRepo.findByUserId(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.userId !== req.user.userId) throw new ForbiddenException();
    return category;
  }

  @Post()
  @ApiOperation({ summary: 'Crear categoría' })
  async create(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoryRepo.create({
      userId: req.user.userId,
      ...dto,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.userId !== req.user.userId) throw new ForbiddenException();
    return this.categoryRepo.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.userId !== req.user.userId) throw new ForbiddenException();
    if (category.isDefault) throw new ForbiddenException('No se puede eliminar una categoría predeterminada');
    await this.categoryRepo.delete(id);
    return { message: 'Categoría eliminada' };
  }
}
