import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '../../sections/entities/section.entity';

@Entity()
export class Day {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  day: string;

  @Column({ select: false })
  owner: string;

  @OneToMany(
    () => Section,
    section => section.day,
    { eager: true, cascade: true },
  )
  sections: Section[];
}
