import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryController } from 'src/api/controllers/dictionary/dictionary.controller';
import { DictionaryService } from 'src/application/services/dictionary/dictionary.service';
import { Definition } from 'src/core/entities/definition.entity';
import { Dictionary } from 'src/core/entities/dictionary.entity';
import { Entry } from 'src/core/entities/entry.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([Dictionary, Entry, Definition ]),
  ],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
