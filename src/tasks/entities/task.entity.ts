import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Scope } from '../../scopes/entities/scope.entity';
import { Section } from '../../sections/entities/section.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  summary: string;

  @Column({ default: '' })
  notes: string;

  @Column({ default: 0 })
  time: number;

  @Column({ default: false })
  isDone: boolean;

  @Column({ default: null })
  start: string;

  @Column({ select: false })
  owner: string;

  @Column()
  dayId: number;

  @Column()
  rank: number;

  @ManyToOne(
    () => Scope,
    scope => scope.tasks,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'scopeId' })
  scope: Scope | null;
  @Column({ default: null })
  scopeId: number | null;

  @ManyToOne(
    () => Section,
    section => section.tasks,
  )
  @JoinColumn({ name: 'sectionId' })
  section: Section;
  @Column()
  sectionId: number;
}
