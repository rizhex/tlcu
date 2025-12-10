import { Module } from '@nestjs/common';
import { EntryService } from 'src/application/services/entry/entry.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryController } from 'src/api/controllers/entry/entry.controller';
import { Entry } from 'src/core/entities/entry.entity';
import { Dictionary } from 'src/core/entities/dictionary.entity';
import { Definition } from 'src/core/entities/definition.entity';


@Module({

    imports:[TypeOrmModule.forFeature([Entry, Dictionary, Definition]),],
    providers:[EntryService],
    controllers:[EntryController]
})
export class EntryModule {}
