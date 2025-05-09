import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { KanbanTask } from './kanban-task.entity';

@Entity('task_assignments')
export class TaskAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @ManyToOne(() => KanbanTask)
  @JoinColumn({ name: 'task_id' })
  task: KanbanTask;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;
}
