import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, RelationId } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Day } from 'src/days/enities/day.entity';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  isPlan: boolean;

  @Column()
  rank: number;

  @Column({ select: false })
  owner: string;

  @OneToMany(
    () => Task,
    task => task.section,
    { eager: true, cascade: true },
  )
  tasks: Task[];

  @ManyToOne(
    () => Day,
    day => day.sections,
  )
  day: Day;

  @RelationId((section: Section) => section.day)
  public dayId: number;
}
