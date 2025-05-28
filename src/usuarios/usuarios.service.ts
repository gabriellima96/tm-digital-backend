import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, CargoUsuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async criar(criarUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { email, senha, ...restoDosDados } = criarUsuarioDto;

    const emailExistente = await this.usuarioRepository.findOneBy({ email });
    if (emailExistente) {
      throw new ConflictException(`Email "${email}" já está em uso.`);
    }

    try {
      const novoUsuario = this.usuarioRepository.create({
        ...restoDosDados,
        email,
        senhaCriptografada: senha,
        cargo: criarUsuarioDto.cargo || CargoUsuario.AGENTE,
        ativo: criarUsuarioDto.ativo !== undefined ? criarUsuarioDto.ativo : true,
      });

      const usuarioSalvo = await this.usuarioRepository.save(novoUsuario);
      return usuarioSalvo;
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      throw new InternalServerErrorException('Erro ao criar o usuário.');
    }
  }

  async buscarTodos(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async buscarUmPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    return usuario;
  }

  async buscarUmPorEmail(email: string, selecionarSenha = false): Promise<Usuario | null> {
    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('usuario')
      .where('usuario.email = :email', { email });

    if (selecionarSenha) {
      queryBuilder.addSelect('usuario.senhaCriptografada');
    }

    const usuario = await queryBuilder.getOne();
    return usuario;
  }

  async atualizar(id: string, atualizarUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.buscarUmPorId(id);

    const { email, senha, ...restoDosDados } = atualizarUsuarioDto;

    if (email && email !== usuario.email) {
      const emailExistente = await this.buscarUmPorEmail(email);
      if (emailExistente && emailExistente.id !== id) {
        throw new ConflictException(`Email "${email}" já está em uso por outro usuário.`);
      }
      usuario.email = email;
    }

    if (senha) {
      usuario.senhaCriptografada = senha;
    }

    if (restoDosDados.nome !== undefined) usuario.nome = restoDosDados.nome;
    if (restoDosDados.cargo !== undefined) usuario.cargo = restoDosDados.cargo;
    if (restoDosDados.ativo !== undefined) usuario.ativo = restoDosDados.ativo;

    try {
      const usuarioSalvo = await this.usuarioRepository.save(usuario);
      return usuarioSalvo;
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error);
      throw new InternalServerErrorException('Erro ao atualizar o usuário.');
    }
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.usuarioRepository.delete(id);

    if (resultado.affected === 0) {
      throw new NotFoundException(`Usuário com o ID "${id}" não encontrado para remoção.`);
    }
  }
}
