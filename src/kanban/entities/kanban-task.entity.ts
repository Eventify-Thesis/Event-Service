import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TaskPriority } from '../dto/create-kanban-task.dto';

@Entity('kanban_tasks')
export class KanbanTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'column_id' })
  columnId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'position' })
  position: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: TaskPriority.MEDIUM,
    nullable: true
  })
  priority: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: '[]'
  })
  labels: string[];

  @Column({ type: 'timestamp', name: 'due_date', nullable: true })
  dueDate: Date;
}
