import { DataSource } from "typeorm";
import { Dictionary } from "../../core/entities/dictionary.entity";
import { Author } from "../../core/entities/author.entity";
import { Entry } from "../../core/entities/entry.entity";
import { User } from "../../core/entities/user.entity";
import { Definition } from "../../core/entities/definition.entity";


export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "admin",
  database: "tesoro_lexicografico_db",
  entities: [Dictionary, Author, Entry, User, Definition], 
  migrations: ["src/infrastructure/database/migrations/*.ts"],
  migrationsTableName: "migrations",
  synchronize: false,
});