import { EntityRepository, Repository } from 'typeorm';
import { TaskAssignment } from '../entities/task-assignment.entity';

@EntityRepository(TaskAssignment)
export class TaskAssignmentRepository extends Repository<TaskAssignment> {
  // Add custom repository methods here if needed
}
