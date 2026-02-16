import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSavingsGoalDto {
  @ApiProperty({ example: 'Vacaciones de verano' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999.99)
  targetAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
