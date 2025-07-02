import { EntityRepository, Repository } from 'typeorm';
import { BookingAnswer } from '../entities/booking-answer.entity';

@EntityRepository(BookingAnswer)
export class BookingAnswerRepository extends Repository<BookingAnswer> {
  // Add custom repository methods here if needed
}
