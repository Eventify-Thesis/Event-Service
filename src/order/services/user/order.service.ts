import { Injectable } from '@nestjs/common';
import { GetOrdersQuery, OrderTime } from '../../dto/get-orders.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../../entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getUserOrders(userId: string, query: GetOrdersQuery) {
    const {
      limit = 10,
      page = 1,
      keyword,
      filterFields,
      sortBy,
      sortDirection,
      time,
      status,
    } = query;
    const skip = (page - 1) * limit;

    // Initialize query builder with necessary joins
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.show', 'show')
      .leftJoin('order.event', 'event')
      .leftJoin('event.setting', 'setting')
      .select([
        'order.id',
        'order.eventId',
        'order.publicId',
        'order.createdAt',
        'order.status',
        'order.paymentProvider',
        'order.paymentProviderTransactionId',
        'order.paymentProviderMetadata',
        'order.paymentRedirectUrl',
        'order.paymentQrCode',
        'order.paidAt',
        'show.id',
        'show.startTime',
        'show.endTime',
        'event.eventName',
        'event.venueName',
        'event.eventBannerUrl',
        'setting.url',
      ])
      .where('order.userId = :userId', { userId });

    if (status && status !== 'ALL') {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // Apply time-based filtering
    if (query.time) {
      const now = new Date();
      if (query.time === OrderTime.UPCOMING) {
        queryBuilder.andWhere('show.endTime > :now', { now });
      } else if (query.time === OrderTime.PAST) {
        queryBuilder.andWhere('show.endTime <= :now', { now });
      }
    }

    // Apply keyword search
    if (keyword) {
      queryBuilder.andWhere(
        '(order.firstName ILIKE :keyword OR order.lastName ILIKE :keyword OR order.email ILIKE :keyword OR order.bookingCode ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // Apply custom field filters
    if (filterFields) {
      Object.entries(filterFields).forEach(([field, conditions]) => {
        if (Array.isArray(conditions)) {
          conditions.forEach((cond, index) => {
            const paramName = `${field}_${index}`;
            queryBuilder.andWhere(
              `order.${field} ${cond.operator} :${paramName}`,
              { [paramName]: cond.value },
            );
          });
        } else {
          queryBuilder.andWhere(
            `order.${field} ${conditions.operator} :${field}`,
            { [field]: conditions.value },
          );
        }
      });
    }

    // Apply sorting
    if (sortBy) {
      queryBuilder.orderBy(
        `order.${sortBy}`,
        sortDirection === 'desc' ? 'DESC' : 'ASC',
      );
    } else {
      queryBuilder.orderBy('order.createdAt', 'DESC');
    }

    // Execute query with pagination
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Return paginated response
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

  async getOrderDetail(orderPublicId: string) {
    const order = this.orderRepository
      .createQueryBuilder('order')
      .where('order.publicId = :orderPublicId', { orderPublicId })
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.attendees', 'attendees')
      .leftJoin('order.show', 'show')
      .leftJoin('order.event', 'event')
      .leftJoinAndSelect('attendees.ticketType', 'ticketType')
      .select([
        'order.id',
        'order.publicId',
        'order.shortId',
        'order.userId',
        'order.firstName',
        'order.lastName',
        'order.email',
        'order.eventId',
        'order.showId',
        'order.bookingCode',
        'order.status',
        'order.subtotalAmount',
        'order.platformDiscountAmount',
        'order.totalAmount',
        'order.reservedUntil',
        'order.stripePaymentIntentId',
        'order.stripePaymentStatus',
        'order.stripePaymentErrorMessage',
        'order.stripeCustomerId',
        'order.paymentProvider',
        'order.paymentProviderTransactionId',
        'order.paymentProviderMetadata',
        'order.paymentRedirectUrl',
        'order.paymentQrCode',
        'order.paidAt',
        'order.createdAt',
        'order.updatedAt',
        'items',
        'attendees',
        'ticketType.name',
        'ticketType.price',
        'ticketType.isFree',
        'ticketType.description',
        'show.startTime',
        'show.endTime',
        'event.eventName',
        'event.venueName',
        'event.eventBannerUrl',
      ])
      .getOne();
    return order;
  }
}
