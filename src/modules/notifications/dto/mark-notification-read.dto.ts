import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const MarkNotificationReadSchema = z.object({
  isRead: z.boolean().optional().default(true),
});

export class MarkNotificationReadDto extends createZodDto(
  MarkNotificationReadSchema,
) {}

export type MarkNotificationReadInput = z.infer<
  typeof MarkNotificationReadSchema
>;
