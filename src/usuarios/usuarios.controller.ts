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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() criarUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuariosService.criar(criarUsuarioDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async buscarTodos(): Promise<Usuario[]> {
    return this.usuariosService.buscarTodos();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async buscarUmPorId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Usuario> {
    return this.usuariosService.buscarUmPorId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async atualizar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() atualizarUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usuariosService.atualizar(id, atualizarUsuarioDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    return this.usuariosService.remover(id);
  }
}
