import { IsNotEmpty, IsString, Length, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateProprietarioDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  nome: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/) // TODO: Criar uma validação de CPF
  cpf: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  pontuacaoCredito: number;
}
