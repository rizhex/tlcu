import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Dictionary, Author, Entry, User, Definition],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        retryDelay: configService.get<number>('DB_RETRY_DELAY', 3001),
        retryAttempts: configService.get<number>('DB_RETRY_ATTEMPTS', 10),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    DictionaryModule,
    EntryModule,
    DefinitionModule,
    AuthorModule,
    OcrModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}