import { EntityRepository, Repository } from 'typeorm';
import { KanbanBoard } from '../entities/kanban-board.entity';

@EntityRepository(KanbanBoard)
export class KanbanBoardRepository extends Repository<KanbanBoard> {
  // Add custom repository methods here if needed
}
