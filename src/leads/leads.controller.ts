import { Controller, Get, Patch, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get(':idLead')
  async buscarUmPorId(
    @Param('idLead', new ParseUUIDPipe({ version: '4' })) idLead: string,
  ): Promise<Lead> {
    return this.leadsService.buscarUmPorId(idLead);
  }

  @Patch(':idLead')
  async atualizar(
    @Param('idLead', new ParseUUIDPipe({ version: '4' })) idLead: string,
    @Body() atualizarLeadDto: UpdateLeadDto,
  ): Promise<Lead> {
    return this.leadsService.atualizar(idLead, atualizarLeadDto);
  }
}
