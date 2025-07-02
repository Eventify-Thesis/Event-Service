import { EntityRepository, Repository } from 'typeorm';
import { KanbanTask } from '../entities/kanban-task.entity';

@EntityRepository(KanbanTask)
export class KanbanTaskRepository extends Repository<KanbanTask> {
  // Add custom repository methods here if needed
}
