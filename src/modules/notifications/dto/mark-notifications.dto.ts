import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const MarkNotificationsSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .optional()
    .describe('Optional array of notification IDs to toggle'),
  isRead: z.boolean().optional().default(true),
});

export class MarkNotificationsDto extends createZodDto(
  MarkNotificationsSchema,
) {}

export type MarkNotificationsInput = z.infer<typeof MarkNotificationsSchema>;
