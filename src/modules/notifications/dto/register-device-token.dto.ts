import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const RegisterDeviceTokenSchema = z.object({
  token: z
    .string()
    .min(10, 'Device token must be at least 10 characters long')
    .max(4096, 'Device token is too long'),
  platform: z
    .enum(['ios', 'android', 'web'])
    .describe('Device platform. Supported values: ios, android, web'),
  appVersion: z
    .string()
    .max(32)
    .optional()
    .describe('Application version for debugging and analytics'),
});

export class RegisterDeviceTokenDto extends createZodDto(
  RegisterDeviceTokenSchema,
) {}

export type RegisterDeviceTokenInput = z.infer<
  typeof RegisterDeviceTokenSchema
>;
