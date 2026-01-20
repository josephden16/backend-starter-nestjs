import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { EMAIL_QUEUE } from './helpers';
import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class EmailQueue {
  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly logger: CustomLogger,
  ) {}

  async addEmailToQueue(emailData: {
    recipient: string;
    subject: string;
    text?: string;
    template?: string;
    context?: Record<string, unknown>;
  }) {
    this.logger.log(
      `Queueing email job - Params - ${JSON.stringify({ emailData })}`,
      'Send Email',
    );
    try {
      await this.emailQueue.add(emailData, {
        attempts: 3, // Retry up to 3 times in case of failure
        backoff: 5000, // Wait 5 seconds before retrying
      });
    } catch (error) {
      this.logger.error(
        `Failed to queue email job - Params - ${JSON.stringify({ emailData })}`,
        error,
      );
    }
  }
}
