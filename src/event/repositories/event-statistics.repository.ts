import { EntityRepository, Repository } from 'typeorm';
import { EventStatistics } from '../entities/event-statistics.entity';

@EntityRepository(EventStatistics)
export class EventStatisticsRepository extends Repository<EventStatistics> {
  // Add custom repository methods here if needed
}
