import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from './entities/estado.entity';
import { CreateEstadoDto } from './dto/create-estado.dto';

@Injectable()
export class EstadosService {
  constructor(
    @InjectRepository(Estado)
    private readonly estadoRepository: Repository<Estado>,
  ) {}

  async criar(criarEstadoDto: CreateEstadoDto): Promise<Estado> {
    const ufExistente = await this.estadoRepository.findOneBy({ uf: criarEstadoDto.uf });
    if (ufExistente) {
      throw new ConflictException(`Já existe um estado cadastrado com a UF ${criarEstadoDto.uf}.`);
    }

    const nomeExistente = await this.estadoRepository.findOneBy({ nome: criarEstadoDto.nome });
    if (nomeExistente) {
      throw new ConflictException(
        `Já existe um estado cadastrado com o nome ${criarEstadoDto.nome}.`,
      );
    }

    const novoEstado = this.estadoRepository.create(criarEstadoDto);
    return this.estadoRepository.save(novoEstado);
  }

  async buscarTodos(): Promise<Estado[]> {
    return this.estadoRepository.find();
  }

  async buscarUm(id: string): Promise<Estado> {
    const estado = await this.estadoRepository.findOneBy({ id });
    if (!estado) {
      throw new NotFoundException(`Estado com o ID "${id}" não encontrado.`);
    }
    return estado;
  }

  async buscarPorUf(uf: string): Promise<Estado> {
    const estado = await this.estadoRepository.findOneBy({ uf }); // (state)
    if (!estado) {
      throw new NotFoundException(`Estado com a UF "${uf}" não encontrado.`);
    }
    return estado;
  }
}
