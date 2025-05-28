import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CampanhaProspeccao } from '../../campanhas/entities/campanha.entity';
import { Proprietario } from '../../proprietarios/entities/proprietario.entity';
import { PropriedadeRural } from '../../propriedades-rurais/entities/propriedade-rural.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum StatusLead {
  NOVO = 'novo',
  EM_CONTATO = 'em_contato',
  QUALIFICADO = 'qualificado',
  NAO_QUALIFICADO = 'nao_qualificado',
  CONVERTIDO_CLIENTE = 'convertido_cliente',
  PERDIDO = 'perdido',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CampanhaProspeccao, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_campanha' })
  campanha: CampanhaProspeccao;

  @ManyToOne(() => Proprietario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proprietario' })
  proprietario: Proprietario;

  @ManyToOne(() => PropriedadeRural, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_propriedade_rural' })
  propriedadeRural?: PropriedadeRural;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario_atribuido' })
  usuarioAtribuido?: Usuario;

  @Column({
    type: 'enum',
    enum: StatusLead,
    default: StatusLead.NOVO,
  })
  status: StatusLead;

  @Column({ type: 'integer', name: 'pontuacao_prioridade', nullable: true })
  pontuacaoPrioridade?: number;

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataAtualizacao: Date;
}
