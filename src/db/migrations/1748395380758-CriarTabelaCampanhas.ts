import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelaCampanhas1748395380758 implements MigrationInterface {
  name = 'CriarTabelaCampanhas1748395380758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."campanhas_prospeccao_status_enum" AS ENUM('planejada', 'ativa', 'pausada', 'concluida', 'arquivada')`,
    );
    await queryRunner.query(
      `CREATE TABLE "campanhas_prospeccao" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(255) NOT NULL, "descricao" text, "data_inicio" TIMESTAMP WITH TIME ZONE, "data_fim" TIMESTAMP WITH TIME ZONE, "status" "public"."campanhas_prospeccao_status_enum" NOT NULL DEFAULT 'planejada', "criterios_filtragem" jsonb, "metas_conversao" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d07382c6dedee2ff816322e68eb" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "campanhas_prospeccao"`);
    await queryRunner.query(`DROP TYPE "public"."campanhas_prospeccao_status_enum"`);
  }
}
