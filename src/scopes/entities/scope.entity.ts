import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';

@Entity()
export class Scope {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortCode: string;

  @Column({ default: false })
  isArchived: boolean;

  @OneToMany(
    () => Task,
    task => task.scope,
  )
  tasks: Task[];
}
