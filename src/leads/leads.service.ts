import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, StatusLead } from './entities/lead.entity';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CampanhaProspeccao } from '../campanhas/entities/campanha.entity';
import { Proprietario } from '../proprietarios/entities/proprietario.entity';
import { PropriedadeRural } from '../propriedades-rurais/entities/propriedade-rural.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(CampanhaProspeccao)
    private readonly campanhaRepository: Repository<CampanhaProspeccao>,
    @InjectRepository(PropriedadeRural)
    private readonly propriedadeRuralRepository: Repository<PropriedadeRural>,
    @InjectRepository(Proprietario)
    private readonly proprietarioRepository: Repository<Proprietario>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async processarCampanhaEGerarLeads(idCampanha: string): Promise<Lead[]> {
    this.logger.log(`Iniciando processamento da campanha ID: ${idCampanha}`);
    const campanha = await this.campanhaRepository.findOneBy({ id: idCampanha });
    if (!campanha) {
      this.logger.error(`Campanha com ID "${idCampanha}" não encontrada.`);
      throw new NotFoundException(`Campanha com ID "${idCampanha}" não encontrada.`);
    }

    if (!campanha.criteriosFiltragem) {
      this.logger.warn(`Campanha ID: ${idCampanha} não possui critérios de filtragem definidos.`);
      throw new BadRequestException(
        `Campanha com ID "${idCampanha}" não possui critérios de filtragem definidos.`,
      );
    }

    const criterios = campanha.criteriosFiltragem as Record<string, any>;

    // Todo - Desenvolver uma query mais complexa
    const queryBuilder = this.propriedadeRuralRepository
      .createQueryBuilder('propriedade')
      .leftJoinAndSelect('propriedade.municipio', 'municipio')
      .leftJoinAndSelect('municipio.estado', 'estado')
      .leftJoinAndSelect('propriedade.proprietarios', 'proprietario')
      .leftJoinAndSelect('propriedade.culturas', 'cultura');

    if (criterios.municipioIds && (criterios.municipioIds as Array<string>).length > 0) {
      queryBuilder.andWhere('municipio.id IN (:...municipioIds)', {
        municipioIds: criterios.municipioIds as Array<string>,
      });
    }
    if (criterios.ufEstado) {
      queryBuilder.andWhere('estado.uf = :ufEstado', { ufEstado: criterios.ufEstado as string });
    }
    if (criterios.culturaIds && (criterios.culturaIds as Array<string>).length > 0) {
      queryBuilder.andWhere('cultura.id IN (:...culturaIds)', {
        culturaIds: criterios.culturaIds as Array<string>,
      });
    }
    if (criterios.areaMinimaHectares) {
      queryBuilder.andWhere('propriedade.areaEmHectares >= :areaMinima', {
        areaMinima: criterios.areaMinimaHectares as number,
      });
    }
    if (criterios.areaMaximaHectares) {
      queryBuilder.andWhere('propriedade.areaEmHectares <= :areaMaxima', {
        areaMaxima: criterios.areaMaximaHectares as number,
      });
    }
    if (criterios.indiceProdutividadeMinimo) {
      queryBuilder.andWhere('propriedade.indiceProdutividade >= :prodMinima', {
        prodMinima: criterios.indiceProdutividadeMinimo as number,
      });
    }

    const propriedadesElegiveis = await queryBuilder.getMany();
    this.logger.log(
      `Campanha ID: ${idCampanha} - ${propriedadesElegiveis.length} propriedades elegíveis encontradas.`,
    );

    const leadsGerados: Lead[] = [];

    for (const propriedade of propriedadesElegiveis) {
      if (propriedade.proprietarios && propriedade.proprietarios.length > 0) {
        for (const proprietario of propriedade.proprietarios) {
          // Verificar se já existe lead existente
          const leadExistente = await this.leadRepository.findOne({
            where: {
              campanha: { id: idCampanha },
              proprietario: { id: proprietario.id },
            },
          });

          if (!leadExistente) {
            const novoLead = this.leadRepository.create({
              campanha: campanha,
              proprietario: proprietario,
              propriedadeRural: propriedade,
              status: StatusLead.NOVO,
            });

            try {
              const leadSalvo = await this.leadRepository.save(novoLead);
              leadsGerados.push(leadSalvo);
            } catch (error) {
              this.logger.error(
                `Erro ao salvar lead para proprietário ${proprietario.id} e propriedade ${propriedade.id}`,
                error,
              );
            }
          }
        }
      }
    }
    this.logger.log(
      `Campanha ID: ${idCampanha} - ${leadsGerados.length} novos leads foram gerados.`,
    );
    return leadsGerados;
  }

  async buscarPorIdCampanha(idCampanha: string): Promise<Lead[]> {
    const whereOptions: { campanha: { id: string } } = { campanha: { id: idCampanha } };
    return this.leadRepository.find({
      where: whereOptions,
      relations: ['campanha', 'proprietario', 'propriedadeRural', 'usuarioAtribuido'],
    });
  }

  async buscarUmPorId(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['campanha', 'proprietario', 'propriedadeRural', 'usuarioAtribuido'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead com o ID "${id}" não encontrado.`);
    }
    return lead;
  }

  async atualizar(idLead: string, atualizarLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.buscarUmPorId(idLead);

    const { idUsuarioAtribuido, status, pontuacaoPrioridade } = atualizarLeadDto;

    if (idUsuarioAtribuido) {
      const usuario = await this.usuarioRepository.findOneBy({ id: idUsuarioAtribuido });
      if (!usuario) {
        throw new BadRequestException(
          `Usuário atribuído com ID "${idUsuarioAtribuido}" não encontrado.`,
        );
      }
      lead.usuarioAtribuido = usuario;
    } else if (idUsuarioAtribuido === null) {
      lead.usuarioAtribuido = undefined;
    }

    if (status) {
      lead.status = status;
    }
    if (pontuacaoPrioridade !== undefined) {
      lead.pontuacaoPrioridade = pontuacaoPrioridade;
    }

    try {
      return await this.leadRepository.save(lead);
    } catch (error) {
      this.logger.error(`Erro ao atualizar lead ID "${idLead}":`, error);
      throw new InternalServerErrorException('Erro ao atualizar o lead.');
    }
  }
}
