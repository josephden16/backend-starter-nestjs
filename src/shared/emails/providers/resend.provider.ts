import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { CreateEmailOptions, Resend } from 'resend';
import { ConfigServiceType } from 'src/config';
import { CustomLogger } from 'src/shared/logger/logger.service';

import { SendEmailDto } from '../helpers';

@Injectable()
export class ResendProvider implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<ConfigServiceType>,
    private readonly logger: CustomLogger,
  ) {}

  resend: Resend;

  onModuleInit() {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY') || '');
  }

  async sendWithResend({
    context,
    subject,
    template,
    recipient,
  }: SendEmailDto) {
    try {
      this.logger.log('About to send email with resend');
      const templatePath = path.join(
        __dirname,
        '../templates/emails',
        `${template}.hbs`,
      );

      this.logger.log(`Template path: ${templatePath}`);

      if (!fs.existsSync(templatePath)) {
        this.logger.error(`Template not found: ${template}`);
        throw new InternalServerErrorException(
          `Template not found: ${template}`,
        );
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateContent);

      const fullContext = {
        ...context,
        subject,
      };

      const htmlContent = compiledTemplate(fullContext);

      const emailData: CreateEmailOptions = {
        from: `${process.env.APP_NAME || 'App'} <${this.configService.get('RESEND_EMAIL_FROM')}>`,
        to: [recipient],
        subject,
        html: htmlContent,
      };

      const result = await this.resend.emails.send(emailData);
      this.logger.log(
        `Email Sent via Resend: - Response - ${JSON.stringify(result)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email via Resend to ${recipient}`,
        error,
      );
    }
  }
}
