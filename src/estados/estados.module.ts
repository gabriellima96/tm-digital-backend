import { Module } from '@nestjs/common';
import { EstadosController } from './estados.controller';
import { EstadosService } from './estados.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Estado } from './entities/estado.entity';
import { MunicipiosModule } from '../municipios/municipios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Estado]), MunicipiosModule],
  controllers: [EstadosController],
  providers: [EstadosService],
  exports: [EstadosService, TypeOrmModule],
})
export class EstadosModule {}
