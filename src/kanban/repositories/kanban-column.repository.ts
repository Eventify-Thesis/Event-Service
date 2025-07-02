import { EntityRepository, Repository } from 'typeorm';
import { KanbanColumn } from '../entities/kanban-column.entity';

@EntityRepository(KanbanColumn)
export class KanbanColumnRepository extends Repository<KanbanColumn> {
  // Add custom repository methods here if needed
}
