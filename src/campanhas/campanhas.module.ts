import { Module } from '@nestjs/common';
import { CampanhasController } from './campanhas.controller';
import { CampanhasService } from './campanhas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampanhaProspeccao } from './entities/campanha.entity';
import { LeadsModule } from 'src/leads/leads.module';

@Module({
  imports: [TypeOrmModule.forFeature([CampanhaProspeccao]), LeadsModule],
  controllers: [CampanhasController],
  providers: [CampanhasService],
  exports: [CampanhasService, TypeOrmModule],
})
export class CampanhasModule {}
