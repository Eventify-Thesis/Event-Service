import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Message, MessageStatus } from './entities/message.entity';
import { CreateMessageDto, MessageType } from './dto/create-message.dto';
import { Event } from '../event/entities/event.entity';
import { Order } from '../order/entities/order.entity';
import { ClerkClient } from '@clerk/backend';
import { Attendee } from 'src/attendee/entities/attendees.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class MessageService {
  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
  ) { }

  async create(createMessageDto: CreateMessageDto) {
    const event = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('event')
      .where('event.id = :eventId', { eventId: createMessageDto.eventId })
      .getOne();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Create base message entity
    const message = this.messageRepository.create({
      ...createMessageDto,
      sentAt: new Date(),
      recipientIds: JSON.stringify(createMessageDto.attendeeIds || []),
      attendeeIds: JSON.stringify(createMessageDto.attendeeIds || []),
      ticketTypeIds: JSON.stringify(createMessageDto.ticketTypeIds || []),
      status: MessageStatus.PENDING,
    });

    // Save the message first
    const savedMessage = await this.messageRepository.save(message);

    try {
      // Handle different message types
      switch (createMessageDto.messageType) {
        case MessageType.ATTENDEE:
          await this.sendAttendeeMessages(createMessageDto, event);
          break;
        case MessageType.ORDER:
          await this.sendOrderMessages(createMessageDto, event);
          break;
        case MessageType.TICKET:
          await this.sendTicketMessages(createMessageDto, event);
          break;
        case MessageType.EVENT:
          await this.sendEventMessages(createMessageDto, event);
          break;
      }

      // Send copy to current user if requested
      if (createMessageDto.sendCopyToCurrentUser && createMessageDto.sentByUserId) {
        try {
          const user = await this.clerkClient.users.getUser(createMessageDto.sentByUserId);
          if (user.emailAddresses?.[0]) {
            await this.sendEmail(user.emailAddresses[0].emailAddress, createMessageDto.subject, createMessageDto.message);
          }
        } catch (error) {
          console.error('Failed to get user from Clerk:', error);
        }
      }

      // Update message status to SENT
      await this.messageRepository.update(savedMessage.id, { status: MessageStatus.SENT });
      savedMessage.status = MessageStatus.SENT;
    } catch (error) {
      // Update message status to FAILED if any error occurs
      await this.messageRepository.update(savedMessage.id, { status: MessageStatus.FAILED });
      savedMessage.status = MessageStatus.FAILED;
      throw error;
    }

    return savedMessage;
  }

  private async sendAttendeeMessages(createMessageDto: CreateMessageDto, event: any) {
    if (!createMessageDto.attendeeIds?.length) return;

    const attendees = await this.dataSource
      .getRepository(Attendee)
      .createQueryBuilder('attendee')
      .where('attendee.id IN (:...ids)', { ids: createMessageDto.attendeeIds })
      .andWhere('attendee.event_id = :eventId', { eventId: createMessageDto.eventId })
      .select(['attendee.email', 'attendee.first_name', 'attendee.last_name'])
      .getMany();

    for (const attendee of attendees) {
      if (createMessageDto.isTest) continue;
      await this.sendEmail(attendee.email, createMessageDto.subject, createMessageDto.message);
    }
  }

  private async sendOrderMessages(createMessageDto: CreateMessageDto, event: any) {
    if (!createMessageDto.orderId) return;

    const order = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .where('order.id = :orderId', { orderId: createMessageDto.orderId })
      .andWhere('order.event_id = :eventId', { eventId: createMessageDto.eventId })
      .select(['order.email', 'order.first_name', 'order.last_name'])
      .getOne();

    if (!order || createMessageDto.isTest) return;

    await this.sendEmail(order.email, createMessageDto.subject, createMessageDto.message);
  }

  private async sendTicketMessages(createMessageDto: CreateMessageDto, event: any) {
    if (!createMessageDto.ticketTypeIds?.length) return;

    const attendees = await this.dataSource
      .getRepository(Attendee)
      .createQueryBuilder('attendee')
      .where('attendee.ticket_type_id IN (:...ids)', { ids: createMessageDto.ticketTypeIds })
      .andWhere('attendee.event_id = :eventId', { eventId: createMessageDto.eventId })
      .andWhere('attendee.status = :status', { status: 'ACTIVE' })
      .select(['attendee.email', 'attendee.first_name', 'attendee.last_name'])
      .getMany();

    const sentEmails = new Set<string>();
    for (const attendee of attendees) {
      if (createMessageDto.isTest || sentEmails.has(attendee.email)) continue;
      await this.sendEmail(attendee.email, createMessageDto.subject, createMessageDto.message);
      sentEmails.add(attendee.email);
    }
  }

  private async sendEventMessages(createMessageDto: CreateMessageDto, event: any) {
    const attendees = await this.dataSource
      .getRepository(Attendee)
      .createQueryBuilder('attendee')
      .where('attendee.event_id = :eventId', { eventId: createMessageDto.eventId })
      .andWhere('attendee.status = :status', { status: 'ACTIVE' })
      .select(['attendee.email', 'attendee.first_name', 'attendee.last_name'])
      .getMany();

    const sentEmails = new Set<string>();
    for (const attendee of attendees) {
      if (createMessageDto.isTest || sentEmails.has(attendee.email)) continue;
      await this.sendEmail(attendee.email, createMessageDto.subject, createMessageDto.message);
      sentEmails.add(attendee.email);
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    await this.emailService.sendMessage(to, subject, html);
  }
}
