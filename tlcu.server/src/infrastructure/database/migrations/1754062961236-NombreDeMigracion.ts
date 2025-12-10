import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeMigracion1754062961236 implements MigrationInterface {
    name = 'NombreDeMigracion1754062961236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" RENAME COLUMN "wordClass" TO "wordClassId"`);
        await queryRunner.query(`ALTER TYPE "public"."definition_wordclass_enum" RENAME TO "definition_wordclassid_enum"`);
        await queryRunner.query(`CREATE TABLE "word_class" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_c4125f05eed5abe674c4248e28d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" DROP CONSTRAINT "UQ_d0cad6322d4f6608152418cf076"`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "wordClassId"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "wordClassId" integer`);
        await queryRunner.query(`ALTER TABLE "definition" ADD CONSTRAINT "FK_0d8513391850bc80b405cc030af" FOREIGN KEY ("wordClassId") REFERENCES "word_class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" DROP CONSTRAINT "FK_0d8513391850bc80b405cc030af"`);
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "wordClassId"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "wordClassId" "public"."definition_wordclassid_enum"`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" ADD "description" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" ADD "code" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ontological_classification" ADD CONSTRAINT "UQ_d0cad6322d4f6608152418cf076" UNIQUE ("code")`);
        await queryRunner.query(`DROP TABLE "word_class"`);
        await queryRunner.query(`ALTER TYPE "public"."definition_wordclassid_enum" RENAME TO "definition_wordclass_enum"`);
        await queryRunner.query(`ALTER TABLE "definition" RENAME COLUMN "wordClassId" TO "wordClass"`);
    }

}
