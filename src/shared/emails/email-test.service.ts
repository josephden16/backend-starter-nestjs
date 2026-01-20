import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigServiceType } from 'src/config';
import { OTP_EXPIRATION_TIME } from 'src/constants';

import { EmailService } from './email.service';
import { EMAIL_SUBJECTS, EMAIL_TEMPLATES } from './helpers';

@Injectable()
export class EmailTestService {
  private readonly logger = new Logger(EmailTestService.name);
  private readonly frontendUrl: string;

  constructor(
    private emailService: EmailService,
    private configService: ConfigService<ConfigServiceType, true>,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL');
  }

  async sendTestEmail(recipientEmail: string) {
    try {
      const context = {
        frontendUrl: this.frontendUrl,
        currentYear: new Date().getFullYear(),
      };

      await this.emailService.sendEmail({
        recipientEmail,
        subject: EMAIL_SUBJECTS.TEST,
        template: EMAIL_TEMPLATES.TEST,
        context,
      });

      this.logger.log(`Test email sent to ${recipientEmail}`);
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send test email:', error);
      return { success: false, message: 'Failed to send test email' };
    }
  }

  async sendTestVerificationEmail(
    recipientEmail: string,
    userName: string = 'Test User',
  ) {
    try {
      const context = {
        userName,
        url: `${this.frontendUrl}/verify-email?token=test-token-123`,
        expiryTime: 24,
        frontendUrl: this.frontendUrl,
        currentYear: new Date().getFullYear(),
      };

      await this.emailService.sendEmail({
        recipientEmail,
        subject: EMAIL_SUBJECTS.EMAIL_VERIFICATION,
        template: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
        context,
      });

      this.logger.log(`Test verification email sent to ${recipientEmail}`);
      return {
        success: true,
        message: 'Test verification email sent successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send test verification email:', error);
      return {
        success: false,
        message: 'Failed to send test verification email',
      };
    }
  }

  async sendTestPasswordResetEmail(
    recipientEmail: string,
    userName: string = 'Test User',
  ) {
    try {
      const context = {
        userName,
        code: '123456',
        expiryMinutes: OTP_EXPIRATION_TIME,
        requestIP: '127.0.0.1',
        requestDate: new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        frontendUrl: this.frontendUrl,
        currentYear: new Date().getFullYear(),
      };

      await this.emailService.sendEmail({
        recipientEmail,
        subject: EMAIL_SUBJECTS.CREDENTIAL_RESET_USER,
        template: EMAIL_TEMPLATES.PASSWORD_RESET,
        context,
      });

      this.logger.log(`Test password reset email sent to ${recipientEmail}`);
      return {
        success: true,
        message: 'Test password reset email sent successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send test password reset email:', error);
      return {
        success: false,
        message: 'Failed to send test password reset email',
      };
    }
  }

  /**
   * Test any email template with sample data
   * @param template - The email template to test
   * @param recipientEmail - Email address to send the test email to
   * @param customContext - Optional custom context to override default sample data
   */
  async testEmailTemplate(
    template: EMAIL_TEMPLATES,
    recipientEmail: string,
    customContext?: Record<string, unknown>,
  ) {
    try {
      const context = this.getSampleContextForTemplate(template);
      const mergedContext = { ...context, ...customContext };

      const subject = this.getSubjectForTemplate(template);

      await this.emailService.sendEmail({
        recipientEmail,
        subject,
        template,
        context: mergedContext,
      });

      this.logger.log(
        `Test email sent for template "${template}" to ${recipientEmail}`,
      );
      return {
        success: true,
        message: `Test email for template "${template}" sent successfully`,
        template,
        subject,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send test email for template "${template}":`,
        error,
      );
      return {
        success: false,
        message: `Failed to send test email for template "${template}"`,
        template,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get sample context data for a specific template
   */
  getSampleContextForTemplate(
    template: EMAIL_TEMPLATES,
  ): Record<string, unknown> {
    const baseContext = {
      frontendUrl: this.frontendUrl,
      currentYear: new Date().getFullYear(),
    };

    const dateString = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    switch (template) {
      case EMAIL_TEMPLATES.EMAIL_VERIFICATION:
        return {
          ...baseContext,
          userName: 'Test User',
          code: '123456',
          expiryMinutes: OTP_EXPIRATION_TIME,
        };

      case EMAIL_TEMPLATES.PASSWORD_RESET:
        return {
          ...baseContext,
          userName: 'Test User',
          code: '123456',
          expiryMinutes: OTP_EXPIRATION_TIME,
          requestIP: '127.0.0.1',
          requestDate: dateString,
        };

      case EMAIL_TEMPLATES.ACCOUNT_SUSPENSION:
        return {
          ...baseContext,
          userName: 'Test User',
          reason: 'This is a test reason for account suspension.',
          suspensionDate: dateString,
        };

      case EMAIL_TEMPLATES.ACCOUNT_REACTIVATION:
        return {
          ...baseContext,
          userName: 'Test User',
          loginUrl: `${this.frontendUrl}/login`,
          reactivationDate: dateString,
        };

      case EMAIL_TEMPLATES.ACCOUNT_DELETION:
        return {
          ...baseContext,
          userName: 'Test User',
          confirmationUrl: `${this.frontendUrl}/account/delete/confirm?token=test-token-123`,
          expiryTime: 24,
          requestIP: '127.0.0.1',
          requestDate: dateString,
        };


      case EMAIL_TEMPLATES.TEST:
        return baseContext;

      default:
        return baseContext;
    }
  }

  /**
   * Get the subject line for a specific template
   */
  getSubjectForTemplate(template: EMAIL_TEMPLATES): string {
    switch (template) {
      case EMAIL_TEMPLATES.EMAIL_VERIFICATION:
        return EMAIL_SUBJECTS.EMAIL_VERIFICATION;
      case EMAIL_TEMPLATES.PASSWORD_RESET:
        return EMAIL_SUBJECTS.CREDENTIAL_RESET_USER;
      case EMAIL_TEMPLATES.ACCOUNT_SUSPENSION:
        return EMAIL_SUBJECTS.ACCOUNT_SUSPENSION;
      case EMAIL_TEMPLATES.ACCOUNT_REACTIVATION:
        return EMAIL_SUBJECTS.ACCOUNT_REACTIVATION;
      case EMAIL_TEMPLATES.ACCOUNT_DELETION:
        return EMAIL_SUBJECTS.ACCOUNT_DELETION;
      case EMAIL_TEMPLATES.TEST:
        return EMAIL_SUBJECTS.TEST;
      default:
        return 'Test Email';
    }
  }

  /**
   * Get list of all available email templates
   */
  getAvailableTemplates() {
    return Object.values(EMAIL_TEMPLATES).map((template) => ({
      template,
      subject: this.getSubjectForTemplate(template),
      sampleContext: this.getSampleContextForTemplate(template),
    }));
  }

  /**
   * Test all email templates at once
   */
  async testAllTemplates(recipientEmail: string) {
    const templates = Object.values(EMAIL_TEMPLATES);
    const results: TestEmailResult[] = [];

    type TestEmailResult = {
      success: boolean;
      message: string;
      template: EMAIL_TEMPLATES;
      subject?: string;
      error?: string;
    };

    for (const template of templates) {
      const result = (await this.testEmailTemplate(
        template,
        recipientEmail,
      )) as TestEmailResult;
      results.push(result);
    }

    return {
      success: results.every((r: TestEmailResult) => r.success),
      total: templates.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  // Individual template test methods for convenience

  async sendTestAccountSuspensionEmail(
    recipientEmail: string,
    userName: string = 'Test User',
    reason?: string,
  ) {
    return this.testEmailTemplate(
      EMAIL_TEMPLATES.ACCOUNT_SUSPENSION,
      recipientEmail,
      { userName, reason },
    );
  }

  async sendTestAccountReactivationEmail(
    recipientEmail: string,
    userName: string = 'Test User',
  ) {
    return this.testEmailTemplate(
      EMAIL_TEMPLATES.ACCOUNT_REACTIVATION,
      recipientEmail,
      { userName },
    );
  }

  async sendTestAccountDeletionEmail(
    recipientEmail: string,
    userName: string = 'Test User',
  ) {
    return this.testEmailTemplate(
      EMAIL_TEMPLATES.ACCOUNT_DELETION,
      recipientEmail,
      { userName },
    );
  }

}
