import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { EventRepository } from '../repositories/event.repository';
import { ShowRepository } from '../repositories/show.repository';
import { Quiz } from '../../quiz/entities/quiz.entity';
import { QuizQuestion } from '../../quiz/entities/quiz-question.entity';
import { QuizAnswer } from '../../quiz/entities/quiz-answer.entity';
import { QuizResult } from '../../quiz/entities/quiz-result.entity';
import { EventStatus, MESSAGE } from '../event.constant';
import { Brackets } from 'typeorm';
import { AppException } from 'src/common/exceptions/app.exception';

@Injectable()
export class SuperAdminEventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly showRepository: ShowRepository,
    private readonly entityManager: EntityManager,
  ) {}

  async list(_organizations: any, pagination, { keyword, status }: any) {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.setting', 'setting')
      .leftJoinAndSelect('event.shows', 'shows');

    if (status) {
      queryBuilder.andWhere('event.status = :status', { status });
    }

    if (keyword) {
      const searchKeyword = `%${keyword.trim()}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('event.eventName ILIKE :keyword', { keyword: searchKeyword })
            .orWhere('event.venueName ILIKE :keyword', {
              keyword: searchKeyword,
            })
            .orWhere('event.orgName ILIKE :keyword', {
              keyword: searchKeyword,
            });
        }),
      );
    }

    const [events, total] = await queryBuilder
      .select([
        'event.id',
        'event.eventName',
        'event.venueName',
        'event.status',
        'event.eventBannerUrl',
        'event.organizationId',
        'setting.url',
        'shows.id',
        'shows.startTime',
        'shows.endTime',
      ])
      .skip(pagination.limit * (pagination.page - 1))
      .take(pagination.limit)
      .getManyAndCount();

    const transformed = events.map((event) => {
      const data: any = {
        id: event.id,
        eventName: event.eventName,
        venueName: event.venueName,
        status: event.status,
        eventBannerUrl: event.eventBannerUrl,
        organizationId: event.organizationId,
        url: event.setting?.url || '',
        role: 'SUPERADMIN',
      };

      if (event.shows?.length > 0) {
        data.startTime = event.shows[0].startTime;
        data.endTime = event.shows[0].endTime;
      }

      return data;
    });

    return {
      docs: transformed,
      totalDocs: total,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      currentPage: pagination.page,
    };
  }

  async findOne(eventId: number) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['setting', 'paymentInfo', 'shows'],
    });

    if (!event) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }

    return event;
  }

  async findShows(eventId: number) {
    const show = await this.showRepository
      .createQueryBuilder('shows')
      .leftJoinAndSelect('shows.ticketTypes', 'ticket_types')
      .leftJoin('shows.seatingPlan', 'seating_plans')
      .addSelect([
        'seating_plans.id',
        'seating_plans.name',
        'seating_plans.description',
        'seating_plans.locked',
      ])
      .where('shows.event_id = :eventId', { eventId })
      .getMany();

    if (!show) {
      throw new AppException(MESSAGE.SHOW_NOT_FOUND);
    }

    return show;
  }

  async censorEvent(
    eventId: number,
    status: EventStatus,
    currentStatus: EventStatus,
  ) {
    const validStatuses = [EventStatus.PUBLISHED, EventStatus.CANCELLED];
    if (!validStatuses.includes(status)) {
      throw new AppException(MESSAGE.INVALID_STATUS);
    }

    if (validStatuses.includes(currentStatus)) {
      throw new AppException(MESSAGE.EVENT_ALREADY_CENSORED);
    }

    const event = await this.findOne(eventId);
    if (!event) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }

    event.status = status;
    return await this.eventRepository.save(event);
  }

  async deleteEvent(eventId: number) {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        // 1. Find the event first
        const event = await this.findOne(eventId);
        if (!event) {
          throw new AppException(MESSAGE.EVENT_NOT_FOUND);
        }

        // 2. Delete quiz-related data (deepest in the dependency tree)
        await this.deleteQuizRelatedData(eventId);

        // 3. Delete kanban-related data
        await this.deleteKanbanRelatedData(eventId);

        // 4. Delete order-related data
        await this.deleteOrderRelatedData(eventId);

        // 5. Delete shows and their dependencies
        await this.deleteShowRelatedData(eventId);

        // 6. Delete voucher data
        await this.deleteVoucherData(eventId);

        // 7. Delete facebook data
        await this.deleteFacebookData(eventId);

        // 8. Delete other direct relationships
        await this.deleteDirectRelationships(eventId);

        // 9. Delete statistics
        await this.deleteEventStatistics(eventId);

        // 10. Finally, delete the event
        return await transactionalEntityManager.remove(event);
      },
    );
  }

  private async deleteQuizRelatedData(eventId: number) {
    // Get all quizzes for this event
    const quizzes = await this.entityManager
      .createQueryBuilder(Quiz, 'quiz')
      .where('quiz.event_id = :eventId', { eventId })
      .getMany();

    const quizIds = quizzes.map((quiz) => quiz.id);

    if (quizIds.length === 0) return;

    // Get all questions for these quizzes
    const questions = await this.entityManager
      .createQueryBuilder(QuizQuestion, 'question')
      .where('question.quiz_id IN (:...quizIds)', { quizIds })
      .getMany();

    const questionIds = questions.map((q) => q.id);

    if (questionIds.length > 0) {
      // Delete quiz answers
      await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(QuizAnswer)
        .where('question_id IN (:...questionIds)', { questionIds })
        .execute();

      // Delete quiz questions
      await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(QuizQuestion)
        .where('id IN (:...questionIds)', { questionIds })
        .execute();
    }

    // Delete quiz results
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(QuizResult)
      .where('quiz_id IN (:...quizIds)', { quizIds })
      .execute();

    // Delete quizzes
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Quiz)
      .where('id IN (:...quizIds)', { quizIds })
      .execute();
  }

  private async deleteKanbanRelatedData(eventId: number) {
    // Get all kanban boards for this event
    const boards = await this.entityManager
      .createQueryBuilder()
      .select('board')
      .from('kanban_boards', 'board')
      .where('board.event_id = :eventId', { eventId })
      .getRawMany();

    const boardIds = boards.map((board) => board.board_id);

    if (boardIds.length === 0) return;

    // Get all columns for these boards
    const columns = await this.entityManager
      .createQueryBuilder()
      .select('column')
      .from('kanban_columns', 'column')
      .where('column.board_id IN (:...boardIds)', { boardIds })
      .getRawMany();

    const columnIds = columns.map((col) => col.column_id);

    // Get all tasks for these columns
    const tasks = await this.entityManager
      .createQueryBuilder()
      .select('task')
      .from('kanban_tasks', 'task')
      .where('task.column_id IN (:...columnIds)', { columnIds })
      .getRawMany();

    const taskIds = tasks.map((task) => task.task_id);

    if (taskIds.length > 0) {
      // Delete task assignments
      await this.entityManager
        .createQueryBuilder()
        .delete()
        .from('task_assignments')
        .where('task_id IN (:...taskIds)', { taskIds })
        .execute();

      // Delete tasks
      await this.entityManager
        .createQueryBuilder()
        .delete()
        .from('kanban_tasks')
        .where('id IN (:...taskIds)', { taskIds })
        .execute();
    }

    // Delete columns
    if (columnIds.length > 0) {
      await this.entityManager
        .createQueryBuilder()
        .delete()
        .from('kanban_columns')
        .where('id IN (:...columnIds)', { columnIds })
        .execute();
    }

    // Finally, delete the boards
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from('kanban_boards')
      .where('event_id = :eventId', { eventId })
      .execute();
  }

  private async deleteVoucherData(eventId: number) {
    // Then delete the vouchers
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from('vouchers')
      .where('event_id = :eventId', { eventId })
      .execute();
  }

  private async deleteFacebookData(eventId: number) {
    // Delete Facebook posts first
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from('facebook_posts')
      .where('event_id = :eventId', { eventId })
      .execute();

    // Note: We don't delete Facebook tokens as they are user-specific and can be reused
  }

  private async deleteOrderRelatedData(eventId: number) {
    // Get all shows for this event
    const shows = await this.entityManager
      .createQueryBuilder()
      .select('show')
      .from('shows', 'show')
      .where('show.event_id = :eventId', { eventId })
      .getRawMany();

    const showIds = shows.map((show) => show.show_id);

    if (showIds.length === 0) return;

    // Get all orders for these shows
    const orders = await this.entityManager
      .createQueryBuilder()
      .select('orders')
      .from('orders', 'orders')
      .where('orders.show_id IN (:...showIds)', { showIds })
      .getRawMany();

    const orderIds = orders.map((order) => order.orders_id);

    if (orderIds.length > 0) {
      // Delete attendees first
      await this.entityManager
        .createQueryBuilder()
        .delete()
        .from('attendees')
        .where('order_id IN (:...orderIds)', { orderIds })
        .execute();

      await Promise.all([
        // Delete booking answers
        this.entityManager
          .createQueryBuilder()
          .delete()
          .from('booking_answers')
          .where('order_id IN (:...orderIds)', { orderIds })
          .execute(),

        // Delete attendee check-ins - first get attendee IDs from orders
        this.entityManager
          .createQueryBuilder()
          .delete()
          .from('attendee_check_ins', 'aci')
          .where('aci.attendee_id IN (SELECT id FROM attendees WHERE order_id IN (:...orderIds))', { orderIds })
          .execute(),

        // Delete order items
        this.entityManager
          .createQueryBuilder()
          .delete()
          .from('order_items')
          .where('order_id IN (:...orderIds)', { orderIds })
          .execute(),

        // Delete orders
        this.entityManager
          .createQueryBuilder()
          .delete()
          .from('orders')
          .where('id IN (:...orderIds)', { orderIds })
          .execute(),
      ]);
    }
  }

  private async deleteShowRelatedData(eventId: number) {
    // Get all shows for this event
    const shows = await this.entityManager
      .createQueryBuilder()
      .select('show')
      .from('shows', 'show')
      .where('show.event_id = :eventId', { eventId })
      .getRawMany();

    const showIds = shows.map((show) => show.show_id);

    if (showIds.length === 0) return;

    await Promise.all([
      // Delete ticket types
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('ticket_types')
        .where('show_id IN (:...showIds)', { showIds })
        .execute(),

      // Delete show schedules
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('show_schedules')
        .where('show_id IN (:...showIds)', { showIds })
        .execute(),

      // Delete shows
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('shows')
        .where('event_id = :eventId', { eventId })
        .execute(),
    ]);
  }

  private async deleteDirectRelationships(eventId: number) {
    await Promise.all([
      // Delete settings
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('settings')
        .where('event_id = :eventId', { eventId })
        .execute(),

      // Delete payment info
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('payment_info')
        .where('event_id = :eventId', { eventId })
        .execute(),

      // Delete questions
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('questions')
        .where('event_id = :eventId', { eventId })
        .execute(),

      // Delete seat category mappings
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('seat_category_mappings')
        .where('event_id = :eventId', { eventId })
        .execute(),

      // Delete messages
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('messages')
        .where('event_id = :eventId', { eventId })
        .execute(),
    ]);
  }

  private async deleteEventStatistics(eventId: number) {
    await Promise.all([
      // Delete event statistics
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('event_statistics')
        .where('event_id = :eventId', { eventId })
        .execute(),

      // Delete daily event statistics
      this.entityManager
        .createQueryBuilder()
        .delete()
        .from('event_daily_statistics')
        .where('event_id = :eventId', { eventId })
        .execute(),
    ]);
  }
}
