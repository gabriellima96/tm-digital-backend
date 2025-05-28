import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { MunicipiosService } from './municipios.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { Municipio } from './entities/municipio.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly municipiosService: MunicipiosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() criarMunicipioDto: CreateMunicipioDto): Promise<Municipio> {
    return this.municipiosService.criar(criarMunicipioDto);
  }
}
