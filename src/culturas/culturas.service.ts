import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultura } from './entities/cultura.entity';
import { CreateCulturaDto } from './dto/create-cultura.dto';

@Injectable()
export class CulturasService {
  constructor(
    @InjectRepository(Cultura)
    private readonly culturaRepository: Repository<Cultura>,
  ) {}

  async criar(criarCulturaDto: CreateCulturaDto): Promise<Cultura> {
    const { nome } = criarCulturaDto;

    const culturaExistente = await this.culturaRepository.findOneBy({ nome });
    if (culturaExistente) {
      throw new ConflictException(`Cultura com o nome "${nome}" já existe.`);
    }

    try {
      const novaCultura = this.culturaRepository.create(criarCulturaDto);
      return await this.culturaRepository.save(novaCultura);
    } catch (error: unknown) {
      console.error('Ocorreu um erro ao salvar a cultura:', error);
      throw new InternalServerErrorException('Erro ao salvar a cultura no banco de dados.');
    }
  }

  async buscarTodas(): Promise<Cultura[]> {
    return this.culturaRepository.find();
  }

  async buscarUmPorId(id: string): Promise<Cultura> {
    const cultura = await this.culturaRepository.findOneBy({ id });
    if (!cultura) {
      throw new NotFoundException(`Cultura com o ID "${id}" não encontrada.`);
    }
    return cultura;
  }

  async buscarUmPorNome(nome: string): Promise<Cultura> {
    const cultura = await this.culturaRepository.findOneBy({ nome });
    if (!cultura) {
      throw new NotFoundException(`Cultura com o nome "${nome}" não encontrada.`);
    }
    return cultura;
  }
}
