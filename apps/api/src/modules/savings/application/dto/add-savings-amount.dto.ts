import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSavingsAmountDto {
  @ApiProperty({ example: 100, description: 'Monto a agregar (positivo) o retirar (negativo)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-999999999.99)
  @Max(999999999.99)
  amount: number;
}
