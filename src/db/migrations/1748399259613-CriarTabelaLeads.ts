import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelaLeads1748399259613 implements MigrationInterface {
  name = 'CriarTabelaLeads1748399259613';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."leads_status_enum" AS ENUM('novo', 'em_contato', 'qualificado', 'nao_qualificado', 'convertido_cliente', 'perdido')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."leads_status_enum" NOT NULL DEFAULT 'novo', "pontuacao_prioridade" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id_campanha" uuid NOT NULL, "id_proprietario" uuid NOT NULL, "id_propriedade_rural" uuid, "id_usuario_atribuido" uuid, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_d7fb2e4651d66ffbeba6eeb64ae" FOREIGN KEY ("id_campanha") REFERENCES "campanhas_prospeccao"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_b244bce471ae6674b0e2d41d18f" FOREIGN KEY ("id_proprietario") REFERENCES "proprietarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_d529e07d3175235d78a6309fa9b" FOREIGN KEY ("id_propriedade_rural") REFERENCES "propriedades_rurais"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_223f53cd97d2e432998cb05ff7d" FOREIGN KEY ("id_usuario_atribuido") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_223f53cd97d2e432998cb05ff7d"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_d529e07d3175235d78a6309fa9b"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_b244bce471ae6674b0e2d41d18f"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_d7fb2e4651d66ffbeba6eeb64ae"`);
    await queryRunner.query(`DROP TABLE "leads"`);
    await queryRunner.query(`DROP TYPE "public"."leads_status_enum"`);
  }
}
