import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeMigracion1754085761708 implements MigrationInterface {
    name = 'NombreDeMigracion1754085761708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "senseNumber"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "senseNumber" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "definition" DROP COLUMN "senseNumber"`);
        await queryRunner.query(`ALTER TABLE "definition" ADD "senseNumber" character varying NOT NULL`);
    }

}
