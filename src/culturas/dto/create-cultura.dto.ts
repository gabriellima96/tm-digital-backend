import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCulturaDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  nome: string;
}
