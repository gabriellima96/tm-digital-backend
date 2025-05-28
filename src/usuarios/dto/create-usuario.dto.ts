import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { CargoUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nome: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  senha: string;

  @IsOptional()
  @IsEnum(CargoUsuario, { message: 'O cargo (role) fornecido não é válido.' })
  cargo?: CargoUsuario;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
