export const EMAIL_QUEUE = 'emails';

export enum EMAIL_TEMPLATES {
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
  ACCOUNT_DELETION = 'account-deletion',
  ACCOUNT_SUSPENSION = 'account-suspension',
  ACCOUNT_REACTIVATION = 'account-reactivation',
  TEST = 'test',
}

export const EMAIL_SUBJECTS = {
  EMAIL_VERIFICATION: 'Verify Your Email Address',
  CREDENTIAL_RESET_USER: 'Reset Your Password',
  CREDENTIAL_RESET_ADMIN: 'Reset Your Password - Admin',
  ACCOUNT_DELETION: 'Confirm Account Deletion',
  ACCOUNT_SUSPENSION: 'Account Suspended',
  ACCOUNT_REACTIVATION: 'Account Reactivated - Welcome Back',
  TEST: 'Test Email',
} as const;

export const TEMPLATE_PARTIALS = ['header', 'footer'];

export type SendEmailDto = {
  context: Record<string, unknown>;
  template: EMAIL_TEMPLATES;
  subject: string;
  recipient: string;
};
