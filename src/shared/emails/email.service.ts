import { Injectable } from '@nestjs/common';
import { OTP_EXPIRATION_TIME } from 'src/constants';
import { CustomLogger } from 'src/shared/logger/logger.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

import { EmailQueue } from './email.queue';
import { EMAIL_SUBJECTS, EMAIL_TEMPLATES } from './helpers';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailQueue: EmailQueue,
    private readonly prisma: PrismaService,
    private readonly logger: CustomLogger,
  ) {}

  async sendEmail({
    recipientEmail,
    subject,
    template,
    context,
  }: {
    recipientEmail: string;
    subject: string;
    template?: string;
    context?: Record<string, unknown>;
  }) {
    if (await this.shouldSkipEmail(recipientEmail)) {
      return;
    }

    return await this.emailQueue.addEmailToQueue({
      recipient: recipientEmail,
      subject: subject,
      template: template,
      context: context || {},
    });
  }

  async sendAdminPasswordResetCode(
    email: string,
    code: string,
    userName: string,
    requestIP: string,
  ) {
    return await this.sendEmail({
      recipientEmail: email,
      subject: EMAIL_SUBJECTS.CREDENTIAL_RESET_ADMIN,
      template: EMAIL_TEMPLATES.PASSWORD_RESET,
      context: {
        code,
        userName,
        expiryMinutes: OTP_EXPIRATION_TIME,
        requestIP,
        requestDate: new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    });
  }

  async sendEmailVerification(email: string, code: string, userName: string) {
    return await this.sendEmail({
      recipientEmail: email,
      subject: EMAIL_SUBJECTS.EMAIL_VERIFICATION,
      template: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
      context: {
        code,
        userName,
        expiryMinutes: OTP_EXPIRATION_TIME,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    });
  }

  async sendUserPasswordResetCode(
    email: string,
    code: string,
    userName: string,
  ) {
    return await this.sendEmail({
      recipientEmail: email,
      subject: EMAIL_SUBJECTS.CREDENTIAL_RESET_USER,
      template: EMAIL_TEMPLATES.PASSWORD_RESET,
      context: {
        code,
        userName,
        expiryMinutes: OTP_EXPIRATION_TIME,
        requestDate: new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    });
  }

  async sendAccountSuspensionEmail(
    email: string,
    userName: string,
    reason?: string,
  ) {
    return await this.sendEmail({
      recipientEmail: email,
      subject: EMAIL_SUBJECTS.ACCOUNT_SUSPENSION,
      template: EMAIL_TEMPLATES.ACCOUNT_SUSPENSION,
      context: {
        userName,
        reason,
        suspensionDate: new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      },
    });
  }

  async sendAccountReactivationEmail(email: string, userName: string) {
    return await this.sendEmail({
      recipientEmail: email,
      subject: EMAIL_SUBJECTS.ACCOUNT_REACTIVATION,
      template: EMAIL_TEMPLATES.ACCOUNT_REACTIVATION,
      context: {
        userName,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
        reactivationDate: new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      },
    });
  }


  private async shouldSkipEmail(recipientEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: recipientEmail },
      select: { isDeleted: true, status: true },
    });

    if (user && (user.isDeleted || user.status === 'DELETED')) {
      this.logger.warn('EmailService - skip email to deleted account', {
        recipientEmail,
      });
      return true;
    }

    return false;
  }
}
