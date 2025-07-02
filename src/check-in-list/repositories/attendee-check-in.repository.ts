import { EntityRepository, Repository } from 'typeorm';
import { AttendeeCheckIn } from '../entities/attendee-check-in.entity';

@EntityRepository(AttendeeCheckIn)
export class AttendeeCheckInRepository extends Repository<AttendeeCheckIn> {
  // Add custom repository methods here if needed
}
