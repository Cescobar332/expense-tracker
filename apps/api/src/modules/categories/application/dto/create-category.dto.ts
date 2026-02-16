import { IsNotEmpty, IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Comida rápida' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: ['INCOME', 'EXPENSE'] })
  @IsEnum(['INCOME', 'EXPENSE'], { message: 'type debe ser INCOME o EXPENSE' })
  type: string;

  @ApiProperty({ example: '#ef4444', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'utensils', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}
