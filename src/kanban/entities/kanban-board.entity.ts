import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('kanban_boards')
export class KanbanBoard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id', type: 'int' })
  eventId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
