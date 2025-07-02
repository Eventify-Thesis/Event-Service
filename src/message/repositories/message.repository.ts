import { EntityRepository, Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  // Add custom repository methods here if needed
}
