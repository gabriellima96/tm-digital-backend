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
import { CulturasService } from './culturas.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { Cultura } from './entities/cultura.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('culturas')
export class CulturasController {
  constructor(private readonly culturasService: CulturasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() criarCulturaDto: CreateCulturaDto): Promise<Cultura> {
    return this.culturasService.criar(criarCulturaDto);
  }

  @Get()
  async buscarTodas(): Promise<Cultura[]> {
    return this.culturasService.buscarTodas();
  }

  @Get(':id')
  async buscarUmPorId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Cultura> {
    return this.culturasService.buscarUmPorId(id);
  }

  @Get('nome/:nome')
  async buscarUmPorNome(@Param('nome') nome: string): Promise<Cultura> {
    return this.culturasService.buscarUmPorNome(nome);
  }
}
