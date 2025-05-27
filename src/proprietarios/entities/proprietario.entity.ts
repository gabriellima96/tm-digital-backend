import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Check,
  ManyToMany,
} from 'typeorm';

import { PropriedadeRural } from '../../propriedades-rurais/entities/propriedade-rural.entity';

@Entity('proprietarios')
@Unique(['cpf'])
@Check(`"pontuacao_credito" >= 0 AND "pontuacao_credito" <= 100`) // Constraint para garantir que a pontuação do crédito seja de 0 até 100
export class Proprietario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 14, nullable: false })
  cpf: string;

  @Column({ type: 'integer', name: 'pontuacao_credito', nullable: false })
  pontuacaoCredito: number;

  @ManyToMany(() => PropriedadeRural, (propriedade) => propriedade.proprietarios)
  propriedadesRurais: PropriedadeRural[];

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataAtualizacao: Date;
}
