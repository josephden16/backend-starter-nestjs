import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { EMAIL_TEMPLATES } from '.';

const TestEmailSchema = z.object({
  recipientEmail: z.email('Invalid email format'),
  template: z.enum(Object.values(EMAIL_TEMPLATES)).optional(),
  customContext: z.record(z.string(), z.string()).optional(),
});

const TestSpecificEmailSchema = z.object({
  recipientEmail: z.email('Invalid email format'),
  userName: z.string().optional(),
  planName: z.string().optional(),
  reason: z.string().optional(),
});

const TestAllTemplatesSchema = z.object({
  recipientEmail: z.email('Invalid email format'),
});

const TestBasicEmailSchema = z.object({
  recipientEmail: z.email('Invalid email format'),
});

export class TestEmailDto extends createZodDto(TestEmailSchema) {}
export class TestSpecificEmailDto extends createZodDto(
  TestSpecificEmailSchema,
) {}
export class TestAllTemplatesDto extends createZodDto(TestAllTemplatesSchema) {}
export class TestBasicEmailDto extends createZodDto(TestBasicEmailSchema) {}
