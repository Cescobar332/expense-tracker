import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ChangeCurrencyDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  newCurrency: string;
}
