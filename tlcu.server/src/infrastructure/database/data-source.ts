import { DataSource } from "typeorm";
import { Dictionary } from "../../core/entities/dictionary.entity";
import { Author } from "../../core/entities/author.entity";
import { Entry } from "../../core/entities/entry.entity";
import { User } from "../../core/entities/user.entity";
import { Definition } from "../../core/entities/definition.entity";

// Carga las variables de entorno SEGURO para TypeORM CLI
import * as dotenv from 'dotenv';

// Carga el archivo .env correcto según NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

// Valores con fallbacks seguros
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.DB_PORT || "5432", 10);
const dbUsername = process.env.DB_USERNAME || "postgres";
const dbPassword = process.env.DB_PASSWORD || "admin";
const dbName = process.env.DB_NAME || "tesoro_lexicografico_db";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbName,
  entities: [Dictionary, Author, Entry, User, Definition], 
  migrations: ["src/infrastructure/database/migrations/*.ts"],
  migrationsTableName: "migrations",
  synchronize: false,
  
  // CRÍTICO para evitar conflictos con app.module.ts
  migrationsRun: false,
});