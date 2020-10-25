import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';

@Entity()
@Index(['shortCode', 'owner'], { unique: true })
export class Scope {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortCode: string;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ select: false })
  owner: string;

  @OneToMany(
    () => Task,
    task => task.scope,
  )
  tasks: Task[];
}
