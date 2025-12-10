import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeMigracion1753992086877 implements MigrationInterface {
    name = 'NombreDeMigracion1753992086877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ontological_classification" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "description" character varying(255) NOT NULL, CONSTRAINT "UQ_d0cad6322d4f6608152418cf076" UNIQUE ("code"), CONSTRAINT "PK_f21a195214b8d4303300cfc4d86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."definition_wordclass_enum" AS ENUM('verbo', 'sustantivo', 'sustantivo/adjetivo', 'adjetivo', 'adjetivo/sustantivo', 'adverbio', 'interjección', 'preposición', 'conjunción', 'locución sustantiva', 'locución adjetiva', 'locución sustantiva/adjetiva', 'locución verbal', 'locución preposicional', 'locución conjuntiva', 'locución adverbial', 'artículo', 'prefijo', 'sufijo', 'pronombre', 'nombre propio', 'locución interjectiva', 'refrán')`);
        await queryRunner.query(`CREATE TABLE "definition" ("id" SERIAL NOT NULL, "defText" character varying NOT NULL, "senseNumber" character varying NOT NULL, "wordClass" "public"."definition_wordclass_enum", "etymology" character varying NOT NULL, "remarks" character varying NOT NULL, "entryId" integer, "ontologicalClassificationId" integer, CONSTRAINT "PK_5eb37954eebae17387f4ebabb5c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "entry" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "regName" character varying NOT NULL, "isParent" boolean NOT NULL, "isChild" boolean NOT NULL, "dictionaryId" integer, "parentId" integer, CONSTRAINT "PK_a58c675c4c129a8e0f63d3676d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "author" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "dictionaryId" integer, CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dictionary" ("id" SERIAL NOT NULL, "fileNameXML" character varying NOT NULL, "name" character varying NOT NULL, "title" character varying NOT NULL, "fullTitle" character varying NOT NULL, "author" character varying NOT NULL, "originalDate" character varying NOT NULL, "century" character varying NOT NULL, "publishingPlace" character varying NOT NULL, "publisher" character varying NOT NULL, "publishingDate" character varying NOT NULL, "edition" character varying NOT NULL, "sourceName" character varying NOT NULL, "sourceURL" character varying NOT NULL, "remarks" character varying NOT NULL, "projectName" character varying NOT NULL, "transcriber" character varying NOT NULL, "transcriptionDate" character varying NOT NULL, "revisorName" character varying NOT NULL, "revisionDate" character varying NOT NULL, "prologueName" character varying NOT NULL, "prologueURL" character varying NOT NULL, CONSTRAINT "PK_d17df343bd5d01ed62dd0e55e4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('Admin', 'Editor')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'Editor', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "definition" ADD CONSTRAINT "FK_075d02c6fb60f50f8a2d4565cce" FOREIGN KEY ("entryId") REFERENCES "entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "definition" ADD CONSTRAINT "FK_cc23255b2be89fefcffea455959" FOREIGN KEY ("ontologicalClassificationId") REFERENCES "ontological_classification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry" ADD CONSTRAINT "FK_01340c6af5fcc4842cb11d528fe" FOREIGN KEY ("dictionaryId") REFERENCES "dictionary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry" ADD CONSTRAINT "FK_3a0ad782de67b7e5c3a5823c74e" FOREIGN KEY ("parentId") REFERENCES "entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "author" ADD CONSTRAINT "FK_4244ea20e88398de3de163cc2c0" FOREIGN KEY ("dictionaryId") REFERENCES "dictionary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "author" DROP CONSTRAINT "FK_4244ea20e88398de3de163cc2c0"`);
        await queryRunner.query(`ALTER TABLE "entry" DROP CONSTRAINT "FK_3a0ad782de67b7e5c3a5823c74e"`);
        await queryRunner.query(`ALTER TABLE "entry" DROP CONSTRAINT "FK_01340c6af5fcc4842cb11d528fe"`);
        await queryRunner.query(`ALTER TABLE "definition" DROP CONSTRAINT "FK_cc23255b2be89fefcffea455959"`);
        await queryRunner.query(`ALTER TABLE "definition" DROP CONSTRAINT "FK_075d02c6fb60f50f8a2d4565cce"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "dictionary"`);
        await queryRunner.query(`DROP TABLE "author"`);
        await queryRunner.query(`DROP TABLE "entry"`);
        await queryRunner.query(`DROP TABLE "definition"`);
        await queryRunner.query(`DROP TYPE "public"."definition_wordclass_enum"`);
        await queryRunner.query(`DROP TABLE "ontological_classification"`);
    }

}
