import { EntityRepository, Repository } from 'typeorm';
import { ShowSchedule } from '../entities/show-schedule.entity';

@EntityRepository(ShowSchedule)
export class ShowScheduleRepository extends Repository<ShowSchedule> {
  // Add custom repository methods here if needed
}
