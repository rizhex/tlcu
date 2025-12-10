import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeMigracion1754270882106 implements MigrationInterface {
    name = 'NombreDeMigracion1754270882106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" DROP CONSTRAINT "FK_cc23255b2be89fefcffea455959"`);
        await queryRunner.query(`ALTER TABLE "definition" DROP CONSTRAINT "FK_0d8513391850bc80b405cc030af"`);
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "ontologicalClassificationId"`);
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "wordClassId"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "wordClass" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "ontologicalClassification" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "definition" ALTER COLUMN "senseNumber" SET DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" ALTER COLUMN "senseNumber" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "ontologicalClassification"`);
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "wordClass"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "wordClassId" integer`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "ontologicalClassificationId" integer`);
        await queryRunner.query(`ALTER TABLE "definition" ADD CONSTRAINT "FK_0d8513391850bc80b405cc030af" FOREIGN KEY ("wordClassId") REFERENCES "word_class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "definition" ADD CONSTRAINT "FK_cc23255b2be89fefcffea455959" FOREIGN KEY ("ontologicalClassificationId") REFERENCES "ontological_classification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
