import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsObject,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePropriedadeRuralDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nomeFazenda?: string;

  @IsOptional()
  @IsObject()
  poligono?: object;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Transformação string => number
  @Min(0.01)
  areaEmHectares: number;

  @IsNotEmpty()
  @IsUUID('4')
  idMunicipio: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(1000)
  indiceProdutividade?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true,
  })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um proprietário (owner).' })
  idsProprietarios: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  idsCulturas?: string[];
}
