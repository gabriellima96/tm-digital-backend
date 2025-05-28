import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsDateString,
  IsObject,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { StatusCampanha } from '../entities/campanha.entity';

export class CreateCampanhaDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf((o: CreateCampanhaDto) => o.dataInicio !== undefined) // Valida dataFim apenas se dataInicio for fornecida
  dataFim?: string;

  @IsOptional()
  @IsEnum(StatusCampanha)
  status?: StatusCampanha;

  @IsOptional()
  @IsObject() // Os critérios de filtragem deve ser um json valido.
  criteriosFiltragem?: object;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  metasConversao?: string;
}
