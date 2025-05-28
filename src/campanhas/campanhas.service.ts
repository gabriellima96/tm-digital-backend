import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampanhaProspeccao, StatusCampanha } from './entities/campanha.entity';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { UpdateCampanhaDto } from './dto/update-campanha.dto';

@Injectable()
export class CampanhasService {
  constructor(
    @InjectRepository(CampanhaProspeccao)
    private readonly campanhaRepository: Repository<CampanhaProspeccao>,
  ) {}

  // Validar as datas da campanha
  private validarDatas(dataInicio?: string | Date, dataFim?: string | Date): void {
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (fim <= inicio) {
        throw new BadRequestException(
          'A data de fim (endDate) deve ser posterior à data de início (startDate).',
        );
      }
    }
  }

  async criar(criarCampanhaDto: CreateCampanhaDto): Promise<CampanhaProspeccao> {
    this.validarDatas(criarCampanhaDto.dataInicio, criarCampanhaDto.dataFim);

    try {
      const novaCampanha = this.campanhaRepository.create({
        ...criarCampanhaDto,
        dataInicio: criarCampanhaDto.dataInicio ? new Date(criarCampanhaDto.dataInicio) : undefined,
        dataFim: criarCampanhaDto.dataFim ? new Date(criarCampanhaDto.dataFim) : undefined,
        status: criarCampanhaDto.status || StatusCampanha.PLANEJADA,
      });
      return await this.campanhaRepository.save(novaCampanha);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw new InternalServerErrorException('Erro ao salvar a campanha no banco de dados.');
    }
  }

  async buscarTodas(): Promise<CampanhaProspeccao[]> {
    return this.campanhaRepository.find();
  }

  async buscarUmPorId(id: string): Promise<CampanhaProspeccao> {
    const campanha = await this.campanhaRepository.findOneBy({ id });
    if (!campanha) {
      throw new NotFoundException(`Campanha com o ID "${id}" não encontrada.`);
    }
    return campanha;
  }

  async atualizar(
    id: string,
    atualizarCampanhaDto: UpdateCampanhaDto,
  ): Promise<CampanhaProspeccao> {
    const campanha = await this.buscarUmPorId(id);

    // Valida se as datas estão sendo atualizadas ou uma delas em relação à existente
    const dataInicioAtualizada = atualizarCampanhaDto.dataInicio
      ? new Date(atualizarCampanhaDto.dataInicio)
      : campanha.dataInicio;
    const dataFimAtualizada = atualizarCampanhaDto.dataFim
      ? new Date(atualizarCampanhaDto.dataFim)
      : campanha.dataFim;
    this.validarDatas(dataInicioAtualizada, dataFimAtualizada);

    const dadosParaAtualizar = { ...atualizarCampanhaDto };
    if (atualizarCampanhaDto.dataInicio) {
      (dadosParaAtualizar as CampanhaProspeccao).dataInicio = new Date(
        atualizarCampanhaDto.dataInicio,
      );
    }
    if (atualizarCampanhaDto.dataFim) {
      (dadosParaAtualizar as CampanhaProspeccao).dataFim = new Date(atualizarCampanhaDto.dataFim);
    }

    this.campanhaRepository.merge(campanha, dadosParaAtualizar as CampanhaProspeccao);

    try {
      return await this.campanhaRepository.save(campanha);
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      throw new InternalServerErrorException('Erro ao atualizar a campanha no banco de dados.');
    }
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.campanhaRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Campanha com o ID "${id}" não encontrada para remoção.`);
    }
  }
}
