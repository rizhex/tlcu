import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeMigracion1754085641280 implements MigrationInterface {
    name = 'NombreDeMigracion1754085641280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "senseNumber"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "senseNumber" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "senseNumber"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "senseNumber" character varying NOT NULL`);
    }

}
