import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateEstadoDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  nome: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]+$/) // Regex para garantir que sejam apenas letras maiúsculas
  uf: string;
}
