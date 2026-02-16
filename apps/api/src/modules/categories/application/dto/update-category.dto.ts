import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}
