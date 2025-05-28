import { Module } from '@nestjs/common';
import { CampanhasController } from './campanhas.controller';
import { CampanhasService } from './campanhas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampanhaProspeccao } from './entities/campanha.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampanhaProspeccao])],
  controllers: [CampanhasController],
  providers: [CampanhasService],
  exports: [CampanhasService, TypeOrmModule],
})
export class CampanhasModule {}
