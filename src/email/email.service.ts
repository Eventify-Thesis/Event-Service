import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Order } from 'aws-sdk/clients/glue';
import { generateOrderConfirmationEmail } from '../templates/email/order-confirmation.template';
import { generateIssueReportEmail } from '../templates/email/issue-report.template';

@Injectable()
export class EmailService {
  constructor(private readonly mailer: MailerService) {}

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

  async sendIssueReport(issueReport: any, userInfo: any) {
    const supportEmail =
      process.env.SUPPORT_EMAIL || 'support@eventplatform.com';
    const userEmail =
      userInfo?.emailAddresses?.[0]?.emailAddress || userInfo?.email;

    const subject = `[${issueReport.category.toUpperCase()}] ${issueReport.title} - Issue #${issueReport.id}`;
    const html = generateIssueReportEmail(issueReport, userInfo);

    return this.mailer.sendMail({
      to: supportEmail,
      replyTo: userEmail, // So support team can reply directly to user
      subject,
      html,
    });
  }
}
