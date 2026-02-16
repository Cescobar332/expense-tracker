import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max, IsUUID, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ example: 500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999.99)
  amount: number;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'] })
  @IsEnum(['MONTHLY', 'QUARTERLY', 'YEARLY'])
  period: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ required: false, default: 80, description: 'Porcentaje para alerta (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  alertAt?: number;
}
