import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedEstadosTable1748209404327 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "estados" ("id", "nome", "uf", "created_at", "updated_at") VALUES
            (uuid_generate_v4(), 'Minas Gerais', 'MG', NOW(), NOW());
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "estados" WHERE "uf" IN ('MG');`);
  }
}
