import { EntityRepository, Repository } from 'typeorm';
import { EventDailyStatistics } from '../entities/event-statistics.entity';

@EntityRepository(EventDailyStatistics)
export class EventDailyStatisticsRepository extends Repository<EventDailyStatistics> {
  // Add custom repository methods here if needed
}
