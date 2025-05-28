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
  UseGuards,
} from '@nestjs/common';
import { ProprietariosService } from './proprietarios.service';
import { CreateProprietarioDto } from './dto/create-proprietario.dto';
import { UpdateProprietarioDto } from './dto/update-proprietario.dto';
import { Proprietario } from './entities/proprietario.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('proprietarios')
export class ProprietariosController {
  constructor(private readonly proprietariosService: ProprietariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() criarProprietarioDto: CreateProprietarioDto): Promise<Proprietario> {
    return this.proprietariosService.criar(criarProprietarioDto);
  }

  @Get()
  async buscarTodos(): Promise<Proprietario[]> {
    return this.proprietariosService.buscarTodos();
  }

  @Get(':id')
  async buscarUmPorId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Proprietario> {
    return this.proprietariosService.buscarUmPorId(id);
  }

  @Get('cpf/:cpf')
  async buscarUmPorCpf(@Param('cpf') cpf: string): Promise<Proprietario> {
    return this.proprietariosService.buscarUmPorCpf(cpf);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() atualizarProprietarioDto: UpdateProprietarioDto,
  ): Promise<Proprietario> {
    return this.proprietariosService.atualizar(id, atualizarProprietarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    return this.proprietariosService.remover(id);
  }
}
