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
import { PropriedadesRuraisService } from './propriedades-rurais.service';
import { CreatePropriedadeRuralDto } from './dto/create-propriedade-rural.dto';
import { UpdatePropriedadeRuralDto } from './dto/update-propriedade-rural.dto';
import { PropriedadeRural } from './entities/propriedade-rural.entity';

@Controller('propriedades-rurais')
export class PropriedadesRuraisController {
  constructor(private readonly propriedadesRuraisService: PropriedadesRuraisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(
    @Body() criarPropriedadeRuralDto: CreatePropriedadeRuralDto,
  ): Promise<PropriedadeRural> {
    return this.propriedadesRuraisService.criar(criarPropriedadeRuralDto);
  }

  @Get()
  async buscarTodas(): Promise<PropriedadeRural[]> {
    return this.propriedadesRuraisService.buscarTodas();
  }

  @Get(':id')
  async buscarUmPorId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PropriedadeRural> {
    return this.propriedadesRuraisService.buscarUmPorId(id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() atualizarPropriedadeRuralDto: UpdatePropriedadeRuralDto,
  ): Promise<PropriedadeRural> {
    return this.propriedadesRuraisService.atualizar(id, atualizarPropriedadeRuralDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    return this.propriedadesRuraisService.remover(id);
  }
}
