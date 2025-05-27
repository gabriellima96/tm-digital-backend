import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelaCulturas1748309050790 implements MigrationInterface {
  name = 'CriarTabelaCulturas1748309050790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "culturas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_53d8f01eba25b0d50daf730705d" UNIQUE ("nome"), CONSTRAINT "PK_b6e03971235e32ad695a70264fe" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "culturas"`);
  }
}
