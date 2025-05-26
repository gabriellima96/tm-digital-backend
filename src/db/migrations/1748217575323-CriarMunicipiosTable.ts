import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarMunicipiosTable1748217575323 implements MigrationInterface {
  name = 'CriarMunicipiosTable1748217575323';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "municipios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id_estado" uuid NOT NULL, CONSTRAINT "PK_10d04b4b4e39ba40240b61e919d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e787c9bd45b234ec36c04c57bd" ON "municipios" ("nome", "id_estado") `,
    );
    await queryRunner.query(
      `ALTER TABLE "municipios" ADD CONSTRAINT "FK_5ee522a1f8590f26f13f85e12bc" FOREIGN KEY ("id_estado") REFERENCES "estados"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "municipios" DROP CONSTRAINT "FK_5ee522a1f8590f26f13f85e12bc"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_e787c9bd45b234ec36c04c57bd"`);
    await queryRunner.query(`DROP TABLE "municipios"`);
  }
}
