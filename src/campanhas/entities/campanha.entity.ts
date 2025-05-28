import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StatusCampanha {
  PLANEJADA = 'planejada',
  ATIVA = 'ativa',
  PAUSADA = 'pausada',
  CONCLUIDA = 'concluida',
  ARQUIVADA = 'arquivada',
}

@Entity('campanhas_prospeccao')
export class CampanhaProspeccao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'timestamp with time zone', name: 'data_inicio', nullable: true })
  dataInicio?: Date;

  @Column({ type: 'timestamp with time zone', name: 'data_fim', nullable: true })
  dataFim?: Date;

  @Column({
    type: 'enum',
    enum: StatusCampanha,
    default: StatusCampanha.PLANEJADA,
  })
  status: StatusCampanha;

  @Column({ type: 'jsonb', name: 'criterios_filtragem', nullable: true })
  criteriosFiltragem?: object; // Armazenará os critérios como um objeto JSON

  @Column({ type: 'text', name: 'metas_conversao', nullable: true })
  metasConversao?: string;

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataAtualizacao: Date;
}
