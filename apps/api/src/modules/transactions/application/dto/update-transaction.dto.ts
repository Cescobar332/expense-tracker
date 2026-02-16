import { IsOptional, IsNumber, IsEnum, IsString, IsDateString, IsBoolean, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999.99)
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}
