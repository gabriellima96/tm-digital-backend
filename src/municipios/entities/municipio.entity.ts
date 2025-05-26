import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Estado } from '../../estados/entities/estado.entity';

@Entity('municipios')
@Index(['nome', 'estado'], { unique: true }) // Evitar municípios duplicados para o estado
export class Municipio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @ManyToOne(() => Estado, { nullable: false, onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'id_estado' })
  estado: Estado;

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataAtualizacao: Date;
}
