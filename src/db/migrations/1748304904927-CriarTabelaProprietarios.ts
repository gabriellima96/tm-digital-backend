import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelaProprietarios1748304904927 implements MigrationInterface {
  name = 'CriarTabelaProprietarios1748304904927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proprietarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(255) NOT NULL, "cpf" character varying(14) NOT NULL, "pontuacao_credito" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_52fbfb97a0dc2a787183d15af60" UNIQUE ("cpf"), CONSTRAINT "CHK_307ca1324f34c00d9b4166fce1" CHECK ("pontuacao_credito" >= 0 AND "pontuacao_credito" <= 100), CONSTRAINT "PK_d1409e325190d9e8ed2e81dc5d2" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "proprietarios"`);
  }
}
