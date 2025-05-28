import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { CampanhaProspeccao } from 'src/campanhas/entities/campanha.entity';
import { Proprietario } from 'src/proprietarios/entities/proprietario.entity';
import { PropriedadeRural } from 'src/propriedades-rurais/entities/propriedade-rural.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, CampanhaProspeccao, Proprietario, PropriedadeRural, Usuario]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService, TypeOrmModule],
})
export class LeadsModule {}
