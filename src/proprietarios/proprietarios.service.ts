import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proprietario } from './entities/proprietario.entity';
import { CreateProprietarioDto } from './dto/create-proprietario.dto';
import { UpdateProprietarioDto } from './dto/update-proprietario.dto';

@Injectable()
export class ProprietariosService {
  constructor(
    @InjectRepository(Proprietario)
    private readonly proprietarioRepository: Repository<Proprietario>,
  ) {}

  async criar(CreateProprietarioDto: CreateProprietarioDto): Promise<Proprietario> {
    const { cpf } = CreateProprietarioDto;

    const proprietarioExistente = await this.proprietarioRepository.findOneBy({ cpf });
    if (proprietarioExistente) {
      throw new ConflictException(`Proprietário com o CPF ${cpf} já existe.`);
    }

    try {
      const novoProprietario = this.proprietarioRepository.create(CreateProprietarioDto);
      return await this.proprietarioRepository.save(novoProprietario);
    } catch (error: unknown) {
      console.error('Ocorreu um erro ao salvar o proprietário:', error);
      throw new InternalServerErrorException('Erro ao salvar o proprietário no banco de dados.');
    }
  }

  async buscarTodos(): Promise<Proprietario[]> {
    return this.proprietarioRepository.find();
  }

  async buscarUmPorId(id: string): Promise<Proprietario> {
    const proprietario = await this.proprietarioRepository.findOneBy({ id });
    if (!proprietario) {
      throw new NotFoundException(`Proprietário com o ID "${id}" não encontrado.`);
    }
    return proprietario;
  }

  async buscarUmPorCpf(cpf: string): Promise<Proprietario> {
    const proprietario = await this.proprietarioRepository.findOneBy({ cpf });
    if (!proprietario) {
      throw new NotFoundException(`Proprietário com o CPF "${cpf}" não encontrado.`);
    }
    return proprietario;
  }

  async atualizar(
    id: string,
    atualizarProprietarioDto: UpdateProprietarioDto,
  ): Promise<Proprietario> {
    const proprietario = await this.buscarUmPorId(id);

    if (
      atualizarProprietarioDto &&
      atualizarProprietarioDto.cpf &&
      atualizarProprietarioDto.cpf !== proprietario.cpf
    ) {
      const cpfParaVerificar = atualizarProprietarioDto.cpf as string;

      const proprietarioComNovoCpf = await this.proprietarioRepository.findOneBy({
        cpf: cpfParaVerificar,
      });
      if (proprietarioComNovoCpf && proprietarioComNovoCpf.id !== id) {
        throw new ConflictException(
          `Já existe outro proprietário cadastrado com o CPF ${cpfParaVerificar}.`,
        );
      }
    }

    this.proprietarioRepository.merge(proprietario, atualizarProprietarioDto);

    try {
      return await this.proprietarioRepository.save(proprietario);
    } catch (error) {
      console.error('Ocorreu um erro ao atualizar o proprietário:', error);
      throw new InternalServerErrorException('Erro ao atualizar o proprietário no banco de dados.');
    }
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.proprietarioRepository.delete(id);
    // Verifica se foi realizada algum efeito na base, caso contrario retorna uma exception
    if (resultado.affected === 0) {
      throw new NotFoundException(`Proprietário com o ID "${id}" não encontrado para remoção.`);
    }
  }
}
