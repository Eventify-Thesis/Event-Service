import { EntityRepository, Repository } from 'typeorm';
import { Attendee } from '../entities/attendees.entity';

@EntityRepository(Attendee)
export class AttendeeRepository extends Repository<Attendee> {
  // Add custom repository methods here if needed
}
