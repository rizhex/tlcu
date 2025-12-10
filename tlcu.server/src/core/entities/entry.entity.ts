import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, OneToOne } from 'typeorm';
import { Dictionary } from './dictionary.entity';
import { Definition } from './definition.entity';

@Entity()
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  regName: string;

  @Column()
  isParent: boolean;

  @Column()
  isChild: boolean;

  @ManyToOne(() => Dictionary, (dictionary) => dictionary.entries)
  dictionary: Dictionary;

  @OneToMany(() => Definition, (definition) => definition.entry, { cascade: true, onDelete: 'CASCADE' })
  definitions: Definition[];
  
  @ManyToOne(() => Entry, (entry) => entry.subEntries, { nullable: true })
  parent: Entry | null;

  @OneToMany(() => Entry, (entry) => entry.parent, { cascade: true, onDelete: 'CASCADE' })
  subEntries: Entry[];
}