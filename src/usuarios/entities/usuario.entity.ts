import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export enum CargoUsuario {
  AGENTE = 'agente',
  GERENTE = 'gerente',
  ADMIN = 'admin',
}

@Entity('usuarios')
@Unique(['email'])
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: false, select: false, name: 'senha_criptografada' })
  senhaCriptografada: string;

  @Column({
    type: 'enum',
    enum: CargoUsuario,
    default: CargoUsuario.AGENTE,
  })
  cargo: CargoUsuario;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  dataAtualizacao: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async criptografarSenha() {
    if (this.senhaCriptografada) {
      const salt = await bcrypt.genSalt();
      this.senhaCriptografada = await bcrypt.hash(this.senhaCriptografada, salt);
    }
  }

  async validarSenha(senha: string): Promise<boolean> {
    if (!this.senhaCriptografada) return false;
    return bcrypt.compare(senha, this.senhaCriptografada);
  }
}
