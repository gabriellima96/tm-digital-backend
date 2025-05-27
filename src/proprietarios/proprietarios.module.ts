import { Module } from '@nestjs/common';
import { ProprietariosController } from './proprietarios.controller';
import { ProprietariosService } from './proprietarios.service';
import { Proprietario } from './entities/proprietario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Proprietario])],
  controllers: [ProprietariosController],
  providers: [ProprietariosService],
  exports: [ProprietariosService, TypeOrmModule],
})
export class ProprietariosModule {}
