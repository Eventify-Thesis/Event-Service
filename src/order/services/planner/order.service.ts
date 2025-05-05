import { Injectable } from '@nestjs/common';
import { GetOrdersQuery } from '../../dto/get-orders.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { EmailService } from 'src/email/email.service';
import { Event } from 'src/event/entities/event.entity';

@Injectable()
export class PlannerOrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
  ) { }

  async findAll(eventId, query: GetOrdersQuery) {
    const { limit = 10, page = 1, keyword, filterFields, showId, ticketTypeId, sortBy, sortDirection } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.attendees', 'attendees')

    queryBuilder.where('order.eventId = :eventId', { eventId });

    if (keyword) {
      queryBuilder.andWhere(
        '(order.firstName ILIKE :keyword OR order.lastName ILIKE :keyword OR order.email ILIKE :keyword OR order.bookingCode ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    if (filterFields) {
      Object.keys(filterFields).forEach(field => {
        const condition = filterFields[field];
        if (Array.isArray(condition)) {
          condition.forEach(cond => {
            queryBuilder.andWhere(`order.${field} ${cond.operator} :${field}`, { [field]: cond.value });
          });
        } else {
          queryBuilder.andWhere(`order.${field} ${condition.operator} :${field}`, { [field]: condition.value });
        }
      });
    }

    if (showId) {
      queryBuilder.andWhere('order.showId = :showId', { showId });
    }

    if (ticketTypeId) {
      queryBuilder.andWhere('items.ticketTypeId = :ticketTypeId', { ticketTypeId });
    }

    if (sortBy) {
      queryBuilder.orderBy(`order.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('order.createdAt', 'DESC'); // Default sorting
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      totalDocs: total,
      limit,
      totalPages: Math.ceil(total / limit),
      page,
      pagingCounter: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: skip + limit < total,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: skip + limit < total ? page + 1 : null,
      docs: items,
    };
  }

  async getDetail(orderId: number) {
    const order = this.orderRepository.createQueryBuilder('order')
      .where('order.id = :orderId', { orderId })
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.bookingAnswers', 'bookingAnswers')
      .leftJoinAndSelect('order.attendees', 'attendees')
      .leftJoinAndSelect('bookingAnswers.question', 'question')
      .getOne();
    return order;
  }

  async exportOrders(eventId: number) {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.attendees', 'attendees')
      .leftJoinAndSelect('order.bookingAnswers', 'bookingAnswers')
      .leftJoinAndSelect('bookingAnswers.question', 'question')
      .where('order.eventId = :eventId', { eventId });

    return queryBuilder.getMany();
  }

  async sendConfirmation(eventId: number, orderId: number) {
    const order = await this.getDetail(orderId);
    const event = await this.dataSource.getRepository(Event).findOneByOrFail({ id: eventId });

    return this.emailService.sendConfirmation(order, event);
  }
}
