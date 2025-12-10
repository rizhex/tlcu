import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeMigracion1765358189942 implements MigrationInterface {
    name = 'NombreDeMigracion1765358189942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dictionary" DROP COLUMN "fileNameXML"`);
        await queryRunner.query(`ALTER TABLE "dictionary" DROP COLUMN "sourceURL"`);
        await queryRunner.query(`ALTER TABLE "dictionary" DROP COLUMN "prologueURL"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dictionary" ADD "prologueURL" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dictionary" ADD "sourceURL" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dictionary" ADD "fileNameXML" character varying NOT NULL`);
    }

}
