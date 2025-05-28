import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EstadosService } from './estados.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { Estado } from './entities/estado.entity';
import { MunicipiosService } from '../municipios/municipios.service';
import { Municipio } from '../municipios/entities/municipio.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('estados')
export class EstadosController {
  constructor(
    private readonly estadosService: EstadosService,
    private readonly municipiosService: MunicipiosService,
  ) {}

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

  @Get(':id/municipios')
  async buscarMunicipiosDoEstado(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Municipio[]> {
    return this.municipiosService.buscarTodos(id);
  }
}
