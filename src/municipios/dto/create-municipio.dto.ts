import { IsNotEmpty, IsString, Length, IsUUID } from 'class-validator';

export class CreateMunicipioDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  nome: string;

  @IsNotEmpty()
  @IsUUID('4') // Garante que seja um UUID v4
  idEstado: string;
}
