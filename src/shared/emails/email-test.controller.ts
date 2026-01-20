import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevelopmentGuard } from 'src/guards/development.guard';
import { ValidationErrorResponse } from 'src/shared/swagger';

import {
  TestAllTemplatesDto,
  TestBasicEmailDto,
  TestEmailDto,
} from './email.dto';
import { TestSpecificEmailDto } from './email.dto';
import { EmailTestService } from './email-test.service';
import { EMAIL_TEMPLATES } from './helpers';

@ApiTags('Email Testing (Development Only)')
@Controller('emails/test')
@UseGuards(DevelopmentGuard)
export class EmailTestController {
  constructor(private readonly emailTestService: EmailTestService) {}

  @Get('templates')
  @ApiOperation({
    summary: 'Get all available email templates',
    description: 'Returns a list of all available email templates with their sample contexts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved',
    schema: {
      example: {
        status: 'success',
        message: 'Templates retrieved successfully',
        data: {
          templates: [
            { name: 'email-verification', requiredContext: ['userName', 'verificationCode'] },
            { name: 'password-reset', requiredContext: ['userName', 'resetCode'] },
          ],
        },
      },
    },
  })
  getAvailableTemplates() {
    return this.emailTestService.getAvailableTemplates();
  }

  @Post('send')
  @ApiOperation({
    summary: 'Test any email template',
    description: 'Sends a test email using any available template.',
  })
  @ApiResponse({
    status: 200,
    description: 'Test email sent',
    schema: {
      example: {
        status: 'success',
        message: 'Test email sent successfully',
        data: { template: 'email-verification', recipient: 'test@example.com' },
      },
    },
  })
  @ApiResponse({ status: 400, type: ValidationErrorResponse })
  async testEmailTemplate(@Body() dto: TestEmailDto) {
    if (!dto.template) {
      return {
        success: false,
        message: 'Template is required',
        availableTemplates: Object.values(EMAIL_TEMPLATES),
      };
    }

    return this.emailTestService.testEmailTemplate(
      dto.template,
      dto.recipientEmail,
      dto.customContext,
    );
  }

  @Post('send-all')
  @ApiOperation({
    summary: 'Test all email templates',
    description: 'Sends test emails for all available templates to the specified recipient.',
  })
  @ApiResponse({
    status: 200,
    description: 'All test emails sent',
    schema: {
      example: {
        status: 'success',
        message: 'All test emails sent successfully',
        data: { sent: 10, failed: 0 },
      },
    },
  })
  async testAllTemplates(@Body() dto: TestAllTemplatesDto) {
    return this.emailTestService.testAllTemplates(dto.recipientEmail);
  }

  @Post('verification')
  @ApiOperation({ summary: 'Test email verification template' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
    schema: { example: { status: 'success', message: 'Verification email sent' } },
  })
  async testVerificationEmail(@Body() dto: TestSpecificEmailDto) {
    return this.emailTestService.sendTestVerificationEmail(
      dto.recipientEmail,
      dto.userName,
    );
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Test password reset template' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    schema: { example: { status: 'success', message: 'Password reset email sent' } },
  })
  async testPasswordResetEmail(@Body() dto: TestSpecificEmailDto) {
    return this.emailTestService.sendTestPasswordResetEmail(
      dto.recipientEmail,
      dto.userName,
    );
  }

  @Post('account-suspension')
  @ApiOperation({ summary: 'Test account suspension template' })
  @ApiResponse({
    status: 200,
    description: 'Account suspension email sent',
    schema: { example: { status: 'success', message: 'Account suspension email sent' } },
  })
  async testAccountSuspensionEmail(@Body() dto: TestSpecificEmailDto) {
    return this.emailTestService.sendTestAccountSuspensionEmail(
      dto.recipientEmail,
      dto.userName,
      dto.reason,
    );
  }

  @Post('account-reactivation')
  @ApiOperation({ summary: 'Test account reactivation template' })
  @ApiResponse({
    status: 200,
    description: 'Account reactivation email sent',
    schema: { example: { status: 'success', message: 'Account reactivation email sent' } },
  })
  async testAccountReactivationEmail(@Body() dto: TestSpecificEmailDto) {
    return this.emailTestService.sendTestAccountReactivationEmail(
      dto.recipientEmail,
      dto.userName,
    );
  }

  @Post('account-deletion')
  @ApiOperation({ summary: 'Test account deletion template' })
  @ApiResponse({
    status: 200,
    description: 'Account deletion email sent',
    schema: { example: { status: 'success', message: 'Account deletion email sent' } },
  })
  async testAccountDeletionEmail(@Body() dto: TestSpecificEmailDto) {
    return this.emailTestService.sendTestAccountDeletionEmail(
      dto.recipientEmail,
      dto.userName,
    );
  }


  @Post('test')
  @ApiOperation({ summary: 'Test basic test email template' })
  @ApiResponse({
    status: 200,
    description: 'Test email sent',
    schema: { example: { status: 'success', message: 'Test email sent' } },
  })
  async testBasicEmail(@Body() dto: TestBasicEmailDto) {
    return this.emailTestService.sendTestEmail(dto.recipientEmail);
  }
}
