import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToMany,
} from 'typeorm';

import { PropriedadeRural } from '../../propriedades-rurais/entities/propriedade-rural.entity';

@Entity('culturas')
@Unique(['nome'])
export class Cultura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nome: string;

  @ManyToMany(() => PropriedadeRural, (propriedade) => propriedade.culturas)
  propriedadesRurais: PropriedadeRural[];

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataAtualizacao: Date;
}
