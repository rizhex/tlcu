import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Dictionary } from './dictionary.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Dictionary, (dictionary) => dictionary.authors)
  dictionary: Dictionary;
}