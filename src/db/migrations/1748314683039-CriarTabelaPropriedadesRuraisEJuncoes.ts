import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelaPropriedadesRuraisEJuncoes1748314683039 implements MigrationInterface {
  name = 'CriarTabelaPropriedadesRuraisEJuncoes1748314683039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "propriedades_rurais" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nomeFazenda" character varying(255), "poligono" geometry(Polygon,4326), "area_hectares" numeric(10,2) NOT NULL, "indice_produtividade" numeric(5,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id_municipio" uuid NOT NULL, CONSTRAINT "PK_af85764b125f482ba91ddf77887" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "propriedade_proprietario" ("id_propriedade_rural" uuid NOT NULL, "id_proprietario" uuid NOT NULL, CONSTRAINT "PK_3396fda091caa36bc77105d0670" PRIMARY KEY ("id_propriedade_rural", "id_proprietario"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_84b0916944e11ba4c47cdbedee" ON "propriedade_proprietario" ("id_propriedade_rural") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2766501f14df79c4b660c839f5" ON "propriedade_proprietario" ("id_proprietario") `,
    );
    await queryRunner.query(
      `CREATE TABLE "propriedade_cultura" ("id_propriedade_rural" uuid NOT NULL, "id_cultura" uuid NOT NULL, CONSTRAINT "PK_808667f002756d787ee108432cd" PRIMARY KEY ("id_propriedade_rural", "id_cultura"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ed78c2f2bae81d95ea77358ee4" ON "propriedade_cultura" ("id_propriedade_rural") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f6bfc009d64a50aacd0b659b8d" ON "propriedade_cultura" ("id_cultura") `,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedades_rurais" ADD CONSTRAINT "FK_1c58fd5ba0ea174845b4c361e37" FOREIGN KEY ("id_municipio") REFERENCES "municipios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedade_proprietario" ADD CONSTRAINT "FK_84b0916944e11ba4c47cdbedee2" FOREIGN KEY ("id_propriedade_rural") REFERENCES "propriedades_rurais"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedade_proprietario" ADD CONSTRAINT "FK_2766501f14df79c4b660c839f56" FOREIGN KEY ("id_proprietario") REFERENCES "proprietarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedade_cultura" ADD CONSTRAINT "FK_ed78c2f2bae81d95ea77358ee4a" FOREIGN KEY ("id_propriedade_rural") REFERENCES "propriedades_rurais"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedade_cultura" ADD CONSTRAINT "FK_f6bfc009d64a50aacd0b659b8d0" FOREIGN KEY ("id_cultura") REFERENCES "culturas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "propriedade_cultura" DROP CONSTRAINT "FK_f6bfc009d64a50aacd0b659b8d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedade_cultura" DROP CONSTRAINT "FK_ed78c2f2bae81d95ea77358ee4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedade_proprietario" DROP CONSTRAINT "FK_2766501f14df79c4b660c839f56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedade_proprietario" DROP CONSTRAINT "FK_84b0916944e11ba4c47cdbedee2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propriedades_rurais" DROP CONSTRAINT "FK_1c58fd5ba0ea174845b4c361e37"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_f6bfc009d64a50aacd0b659b8d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ed78c2f2bae81d95ea77358ee4"`);
    await queryRunner.query(`DROP TABLE "propriedade_cultura"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2766501f14df79c4b660c839f5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_84b0916944e11ba4c47cdbedee"`);
    await queryRunner.query(`DROP TABLE "propriedade_proprietario"`);
    await queryRunner.query(`DROP TABLE "propriedades_rurais"`);
  }
}
