import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';
import { Estado } from '../estados/entities/estado.entity';
import { CreateMunicipioDto } from './dto/create-municipio.dto';

@Injectable()
export class MunicipiosService {
  constructor(
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
    @InjectRepository(Estado)
    private readonly estadoRepository: Repository<Estado>,
  ) {}

  async criar(criarMunicipioDto: CreateMunicipioDto): Promise<Municipio> {
    const { nome, idEstado } = criarMunicipioDto;
    const estadoExistente = await this.estadoRepository.findOneBy({ id: idEstado });
    if (!estadoExistente) {
      throw new NotFoundException(`Estado com ID "${idEstado}" não encontrado.`);
    }

    const municipioExistenteNoEstado = await this.municipioRepository.findOne({
      where: {
        nome: nome,
        estado: { id: idEstado },
      },
    });

    if (municipioExistenteNoEstado) {
      throw new ConflictException(
        `Município "${nome}" já existe no estado "${estadoExistente.uf}".`,
      );
    }

    try {
      const novoMunicipio = this.municipioRepository.create({
        nome: nome,
        estado: estadoExistente,
      });
      return await this.municipioRepository.save(novoMunicipio);
    } catch (error: unknown) {
      console.error('Ocorreu um erro ao salvar o município:', error);
      throw new InternalServerErrorException('Erro ao salvar o município no banco de dados.');
    }
  }

  async buscarTodos(idEstadoFiltro: string): Promise<Municipio[]> {
    const estadoDoFiltro = await this.estadoRepository.findOneBy({ id: idEstadoFiltro });
    if (!estadoDoFiltro) {
      throw new NotFoundException(`Estado com ID "${idEstadoFiltro}" para filtro não encontrado.`);
    }
    return this.municipioRepository.find({
      where: { estado: { id: idEstadoFiltro } },
    });
  }
}
