import { EntityRepository, Repository } from 'typeorm';
import { OrderItem } from '../entities/order.entity';

@EntityRepository(OrderItem)
export class OrderItemRepository extends Repository<OrderItem> {
  // Add custom repository methods here if needed
}
