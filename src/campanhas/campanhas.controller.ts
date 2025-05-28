import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CampanhasService } from './campanhas.service';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { UpdateCampanhaDto } from './dto/update-campanha.dto';
import { CampanhaProspeccao } from './entities/campanha.entity';
import { LeadsService } from 'src/leads/leads.service';
import { Lead } from '../leads/entities/lead.entity';

@Controller('campanhas')
export class CampanhasController {
  constructor(
    private readonly campanhasService: CampanhasService,
    private readonly leadsService: LeadsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() criarCampanhaDto: CreateCampanhaDto): Promise<CampanhaProspeccao> {
    return this.campanhasService.criar(criarCampanhaDto);
  }

  @Get()
  async buscarTodas(): Promise<CampanhaProspeccao[]> {
    return this.campanhasService.buscarTodas();
  }

  @Get(':id')
  async buscarUmPorId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CampanhaProspeccao> {
    return this.campanhasService.buscarUmPorId(id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() atualizarCampanhaDto: UpdateCampanhaDto,
  ): Promise<CampanhaProspeccao> {
    return this.campanhasService.atualizar(id, atualizarCampanhaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    return this.campanhasService.remover(id);
  }

  @Post(':id/gerar-leads')
  @HttpCode(HttpStatus.OK)
  async gerarLeadsDaCampanha(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string; leadsGerados: number }> {
    const leads = await this.leadsService.processarCampanhaEGerarLeads(id);
    return {
      message: `Processamento de leads para a campanha ${id} concluído.`,
      leadsGerados: leads.length,
    };
  }

  @Get(':id/leads')
  async buscarLeadsDaCampanha(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Lead[]> {
    await this.campanhasService.buscarUmPorId(id);
    return this.leadsService.buscarPorIdCampanha(id);
  }
}
