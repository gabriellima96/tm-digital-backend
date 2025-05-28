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

@Controller('campanhas')
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

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
}
