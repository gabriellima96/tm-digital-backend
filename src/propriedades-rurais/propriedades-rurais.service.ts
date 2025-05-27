import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PropriedadeRural } from './entities/propriedade-rural.entity';
import { CreatePropriedadeRuralDto } from './dto/create-propriedade-rural.dto';
import { UpdatePropriedadeRuralDto } from './dto/update-propriedade-rural.dto';
import { Municipio } from '../municipios/entities/municipio.entity';
import { Proprietario } from '../proprietarios/entities/proprietario.entity';
import { Cultura } from '../culturas/entities/cultura.entity';

@Injectable()
export class PropriedadesRuraisService {
  constructor(
    @InjectRepository(PropriedadeRural)
    private readonly propriedadeRuralRepository: Repository<PropriedadeRural>,
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
    @InjectRepository(Proprietario)
    private readonly proprietarioRepository: Repository<Proprietario>,
    @InjectRepository(Cultura)
    private readonly culturaRepository: Repository<Cultura>,
  ) {}

  async criar(criarPropriedadeRuralDto: CreatePropriedadeRuralDto): Promise<PropriedadeRural> {
    const { idMunicipio, idsProprietarios, idsCulturas, ...dadosPropriedade } =
      criarPropriedadeRuralDto;

    // 1. Verificar se o municipio existe
    const municipio = await this.municipioRepository.findOneBy({ id: idMunicipio });
    if (!municipio) {
      throw new NotFoundException(`Município com ID "${idMunicipio}" não encontrado.`);
    }

    // 2. Verifica se o proprietario existe
    let proprietariosEncontrados: Proprietario[] = [];
    if (idsProprietarios && idsProprietarios.length > 0) {
      proprietariosEncontrados = await this.proprietarioRepository.findBy({
        id: In(idsProprietarios),
      });
      // Caso não seja encontrado um dos proprietarios gera erro.
      if (proprietariosEncontrados.length !== idsProprietarios.length) {
        throw new BadRequestException(
          'Um ou mais IDs de proprietários fornecidos são inválidos ou não foram encontrados.',
        );
      }
    }

    // 3. Verifica se a cultura existe
    let culturasEncontradas: Cultura[] = [];
    if (idsCulturas && idsCulturas.length > 0) {
      culturasEncontradas = await this.culturaRepository.findBy({
        id: In(idsCulturas),
      });
      if (culturasEncontradas.length !== idsCulturas.length) {
        throw new BadRequestException(
          'Um ou mais IDs de culturas fornecidos são inválidos ou não foram encontrados.',
        );
      }
    }

    try {
      const novaPropriedade = this.propriedadeRuralRepository.create({
        ...dadosPropriedade,
        municipio,
        proprietarios: proprietariosEncontrados,
        culturas: culturasEncontradas,
      });

      return await this.propriedadeRuralRepository.save(novaPropriedade);
    } catch (error) {
      console.error('Erro ao criar propriedade rural:', error);
      throw new InternalServerErrorException(
        'Erro ao salvar a propriedade rural no banco de dados.',
      );
    }
  }

  async buscarTodas(): Promise<PropriedadeRural[]> {
    return this.propriedadeRuralRepository.find({
      relations: ['municipio', 'municipio.estado', 'proprietarios', 'culturas'], // Carregar relações importantes
    });
  }

  async buscarUmPorId(id: string): Promise<PropriedadeRural> {
    const propriedade = await this.propriedadeRuralRepository.findOne({
      where: { id },
      relations: ['municipio', 'municipio.estado', 'proprietarios', 'culturas'], // Carregar relações importantes
    });
    if (!propriedade) {
      throw new NotFoundException(`Propriedade Rural com o ID "${id}" não encontrada.`);
    }
    return propriedade;
  }

  async atualizar(
    id: string,
    updatePropriedadeRuralDto: UpdatePropriedadeRuralDto,
  ): Promise<PropriedadeRural> {
    const propriedadeExistente = await this.propriedadeRuralRepository.findOne({
      where: { id },
      relations: ['municipio', 'proprietarios', 'culturas'],
    });

    if (!propriedadeExistente) {
      throw new NotFoundException(`Propriedade Rural com o ID "${id}" não encontrada.`);
    }

    const { idMunicipio, idsProprietarios, idsCulturas, ...dadosPropriedade } =
      updatePropriedadeRuralDto;

    // Atualiza o Município se fornecido
    if (idMunicipio && idMunicipio !== propriedadeExistente.municipio?.id) {
      const municipio = await this.municipioRepository.findOneBy({ id: idMunicipio });
      if (!municipio) {
        throw new NotFoundException(
          `Município com ID "${idMunicipio}" não encontrado para atualização.`,
        );
      }
      propriedadeExistente.municipio = municipio;
    }

    if (idsProprietarios) {
      if (idsProprietarios.length > 0) {
        const novosProprietarios = await this.proprietarioRepository.findBy({
          id: In(idsProprietarios),
        });
        if (novosProprietarios.length !== idsProprietarios.length) {
          throw new BadRequestException(
            'Um ou mais IDs de proprietários para atualização são inválidos ou não foram encontrados.',
          );
        }
        propriedadeExistente.proprietarios = novosProprietarios;
      } else {
        // Considerando no serviço, mas bloqueado no dto.
        propriedadeExistente.proprietarios = [];
      }
    }

    // Atualiza as Culturas se fornecidas
    if (idsCulturas) {
      if (idsCulturas.length > 0) {
        const novasCulturas = await this.culturaRepository.findBy({ id: In(idsCulturas) });
        if (novasCulturas.length !== idsCulturas.length) {
          throw new BadRequestException(
            'Um ou mais IDs de culturas para atualização são inválidos ou não foram encontrados.',
          );
        }
        propriedadeExistente.culturas = novasCulturas;
      } else {
        propriedadeExistente.culturas = [];
      }
    }

    // Mesclar o restante dos dados.
    Object.assign(propriedadeExistente, dadosPropriedade);

    try {
      return await this.propriedadeRuralRepository.save(propriedadeExistente);
    } catch (error) {
      console.error('Erro ao atualizar propriedade rural:', error);
      throw new InternalServerErrorException(
        'Erro ao atualizar a propriedade rural no banco de dados.',
      );
    }
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.propriedadeRuralRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(
        `Propriedade Rural com o ID "${id}" não encontrada para remoção.`,
      );
    }
  }
}
