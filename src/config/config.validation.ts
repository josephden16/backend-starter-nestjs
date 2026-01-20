/* eslint-disable no-console */
import { z } from 'zod';

import { config, MailServiceEnum } from './config';

const possibleEnviroments = ['development', 'production', 'test'] as const;

export enum EnviromentsEnum {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export const configValidationSchema = z.object({
  NODE_ENV: z.enum(possibleEnviroments).default('development'),

  PORT: z.coerce.number().default(config().port),

  FRONTEND_URL: z.string(),

  BACKEND_URL: z.string(),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string(),

  REDIS_PORT: z.coerce.number(),

  REDIS_PASSWORD: z.string().optional(),

  SESSION_SECRET: z.string(),

  MAIL_HOST: z.string(),

  MAIL_PORT: z.coerce.number(),

  MAIL_USER: z.string(),

  MAIL_PASSWORD: z.string(),

  MAIL_FROM: z.string(),

  MAIL_SECURE: z.coerce.boolean().default(false),

  MAIL_SERVICE_PROVIDER: z
    .enum(MailServiceEnum)
    .default(MailServiceEnum.RESEND),

  RESEND_API_KEY: z.string(),

  RESEND_EMAIL_FROM: z.string(),

  JWT_REFRESH_SECRET: z.string(),

  JWT_SECRET: z.string(),

  JWT_EXPIRY_TIME: z.string().default('12h'),

  JWT_REFRESH_EXPIRY_TIME: z.string().default('7d'),

  BASIC_AUTH_ENABLED: z.string().transform((val: string) => val === 'true'),

  SECURITY_ALERT_EMAIL: z.string(),

  CLOUDINARY_CLOUD_NAME: z.string(),

  CLOUDINARY_API_KEY: z.string(),

  CLOUDINARY_API_SECRET: z.string(),

  ADMIN_EMAIL: z.email(),

  ADMIN_PASSWORD: z
    .string()
    .min(6, 'Admin password must be at least 6 characters'),

  ADMIN_PHONE_NUMBER: z.string(),

  GOOGLE_CLIENT_ID: z.string().optional(),

  GOOGLE_CLIENT_SECRET: z.string().optional(),

  PAYSTACK_SECRET_KEY: z.string(),

  PAYSTACK_PUBLIC_KEY: z.string(),

  PAYSTACK_BASE_URL: z.string().default('https://api.paystack.co'),

  FIREBASE_PROJECT_ID: z.string(),

  FIREBASE_CLIENT_EMAIL: z.string(),

  FIREBASE_PRIVATE_KEY: z.string(),

  FIREBASE_NOTIFICATIONS_RETENTION_DAYS: z.coerce.number().default(90),
});

try {
  configValidationSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const issues = error.issues;
    console.error('Environment validation error(s):');
    for (const issue of issues) {
      console.error(
        '------------------------------------------------------------------------',
      );
      console.error(`❌ Invalid environment variable: ${issue.path.join('.')}`);
      console.error(`   Reason: ${issue.message}`);
    }
  }
  process.exit(1);
}

export type ConfigServiceType = z.infer<typeof configValidationSchema>;
