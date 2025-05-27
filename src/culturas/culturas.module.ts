import { Module } from '@nestjs/common';
import { CulturasController } from './culturas.controller';
import { CulturasService } from './culturas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cultura } from './entities/cultura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cultura])],
  controllers: [CulturasController],
  providers: [CulturasService],
  exports: [CulturasService, TypeOrmModule],
})
export class CulturasModule {}
