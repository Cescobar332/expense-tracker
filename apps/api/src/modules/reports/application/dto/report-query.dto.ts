import { IsNotEmpty, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportQueryDto {
  @ApiProperty({ description: 'Fecha de inicio' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Fecha de fin' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ required: false, enum: ['INCOME', 'EXPENSE'] })
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type?: string;
}
