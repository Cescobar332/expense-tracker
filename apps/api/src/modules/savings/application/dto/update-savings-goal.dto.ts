import { IsOptional, IsNumber, IsString, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSavingsGoalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999.99)
  targetAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
