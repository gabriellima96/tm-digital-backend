import { IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { StatusLead } from '../entities/lead.entity';

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(StatusLead, {
    message: 'O status (status) fornecido não é um valor válido.',
  })
  status?: StatusLead;

  @IsOptional()
  @IsUUID('4')
  idUsuarioAtribuido?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  pontuacaoPrioridade?: number;
}
