import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './infrastructure/modules/user/user.module';
import { DictionaryModule } from './infrastructure/modules/dictionary/dictionary.module';
import { EntryModule } from './infrastructure/modules/entry/entry.module';
import { DefinitionModule } from './infrastructure/modules/definition/definition.module';
import { AuthorModule } from './infrastructure/modules/author/author.module';
import { OcrModule } from './infrastructure/modules/ocr/ocr.module';
import { AuthModule } from './infrastructure/modules/auth/auth.module';
import { User } from './core/entities/user.entity';
import { Dictionary } from './core/entities/dictionary.entity';
import { Author } from './core/entities/author.entity';
import { Entry } from './core/entities/entry.entity';
import { Definition } from './core/entities/definition.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'tesoro_lexicografico_db',
      entities: [Dictionary, Author, Entry, User, Definition], 
      synchronize: false,
      retryDelay: 3001,
      retryAttempts: 10
    }),
    UserModule,
    DictionaryModule,
    EntryModule,
    DefinitionModule,
    AuthorModule,
    OcrModule,
    AuthModule
  ],
  controllers: [AppController], 
  providers: [AppService],      
})
export class AppModule {}