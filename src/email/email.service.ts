import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Order } from 'aws-sdk/clients/glue';
import { generateOrderConfirmationEmail } from '../templates/email/order-confirmation.template';

@Injectable()
export class EmailService {
  constructor(private readonly mailer: MailerService) { }

  async sendConfirmation(order: any, event: any) {
    const subject = `Order Confirmation - ${event.eventName}`;
    const html = generateOrderConfirmationEmail(order, event);

    return this.mailer.sendMail({
      to: order.email,
      subject,
      html,
    });
  }

  async sendMessage(to: string, subject: string, message: string) {
    return this.mailer.sendMail({
      to,
      subject,
      html: message,
    });
  }
}
