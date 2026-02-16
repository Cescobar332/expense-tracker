import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, IsDateString, IsBoolean, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 150.50, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999.99)
  amount: number;

  @ApiProperty({ example: 'uuid-de-categoria' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ enum: ['INCOME', 'EXPENSE'] })
  @IsEnum(['INCOME', 'EXPENSE'], { message: 'type debe ser INCOME o EXPENSE' })
  type: string;

  @ApiProperty({ example: '2024-01-15', description: 'Fecha en formato ISO' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Compra supermercado', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}
