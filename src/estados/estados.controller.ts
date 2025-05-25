import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EstadosService } from './estados.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { Estado } from './entities/estado.entity';

@Controller('estados')
export class EstadosController {
  constructor(private readonly estadosService: EstadosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() criarEstadoDto: CreateEstadoDto): Promise<Estado> {
    return this.estadosService.criar(criarEstadoDto);
  }

  @Get()
  async buscarTodos(): Promise<Estado[]> {
    return this.estadosService.buscarTodos();
  }

  @Get(':id')
  async buscarUm(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<Estado> {
    return this.estadosService.buscarUm(id);
  }

  @Get('uf/:uf')
  async buscarPorUf(@Param('uf') uf: string): Promise<Estado> {
    return this.estadosService.buscarPorUf(uf.toUpperCase());
  }
}
