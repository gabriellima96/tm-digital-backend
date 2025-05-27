import { Module } from '@nestjs/common';
import { PropriedadesRuraisController } from './propriedades-rurais.controller';
import { PropriedadesRuraisService } from './propriedades-rurais.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropriedadeRural } from './entities/propriedade-rural.entity';
import { Proprietario } from '../proprietarios/entities/proprietario.entity';
import { Cultura } from '../culturas/entities/cultura.entity';
import { Municipio } from '../municipios/entities/municipio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PropriedadeRural, Municipio, Proprietario, Cultura])],
  controllers: [PropriedadesRuraisController],
  providers: [PropriedadesRuraisService],
  exports: [PropriedadesRuraisService, TypeOrmModule],
})
export class PropriedadesRuraisModule {}
