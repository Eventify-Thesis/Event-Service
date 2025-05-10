import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('kanban_columns')
export class KanbanColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'board_id' })
  boardId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  position: number;
}
