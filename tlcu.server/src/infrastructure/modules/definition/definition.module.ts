import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefinitionController } from 'src/api/controllers/definition/definition.controller';
import { DefinitionService } from 'src/application/services/definition/definition.service';
import { Definition } from 'src/core/entities/definition.entity';
import { Entry } from 'src/core/entities/entry.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([Definition, Entry]),
  ],
  controllers: [DefinitionController],
  providers: [DefinitionService]})
export class DefinitionModule {}
