import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Municipio } from '../../municipios/entities/municipio.entity';
import { Proprietario } from '../../proprietarios/entities/proprietario.entity';
import { Cultura } from '../../culturas/entities/cultura.entity';

@Entity('propriedades_rurais')
export class PropriedadeRural {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeFazenda?: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon', // Especifica que o esperado é um Polígono
    srid: 4326, // Sistema de Referência Espacial - TODO estudar
    nullable: true,
  })
  poligono?: string | object;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, name: 'area_hectares' })
  areaEmHectares: number;

  @ManyToOne(() => Municipio, { nullable: false, eager: false })
  @JoinColumn({ name: 'id_municipio' })
  municipio: Municipio;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'indice_produtividade' })
  indiceProdutividade?: number;

  @ManyToMany(() => Proprietario, (proprietario) => proprietario.propriedadesRurais, {
    cascade: true,
  })
  @JoinTable({
    name: 'propriedade_proprietario',
    joinColumn: {
      name: 'id_propriedade_rural',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'id_proprietario',
      referencedColumnName: 'id',
    },
  })
  proprietarios: Proprietario[];

  @ManyToMany(() => Cultura, (cultura) => cultura.propriedadesRurais, { cascade: true })
  @JoinTable({
    name: 'propriedade_cultura',
    joinColumn: {
      name: 'id_propriedade_rural',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'id_cultura',
      referencedColumnName: 'id',
    },
  })
  culturas: Cultura[];

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataAtualizacao: Date;
}
