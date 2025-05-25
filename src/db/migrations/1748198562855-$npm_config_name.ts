import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1748198562855 implements MigrationInterface {
  name = ' $npmConfigName1748198562855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "estados" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(100) NOT NULL, "uf" character varying(2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_727d8a05d0f922861f13978ac5d" UNIQUE ("uf"), CONSTRAINT "PK_3d9a9f2658d5086012f27924d30" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "estados"`);
  }
}
