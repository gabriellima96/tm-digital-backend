import { Module } from '@nestjs/common';
import { MunicipiosController } from './municipios.controller';
import { MunicipiosService } from './municipios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';
import { Estado } from '../estados/entities/estado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Municipio, Estado])],
  controllers: [MunicipiosController],
  providers: [MunicipiosService],
  exports: [MunicipiosService, TypeOrmModule],
})
export class MunicipiosModule {}
