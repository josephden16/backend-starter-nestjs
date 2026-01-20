import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .optional()
    .describe('Admin first name'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .optional()
    .describe('Admin last name'),
});

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

// Separate DTO for multipart form data with optional file
export class UpdateProfileWithPhotoDto {
  firstName?: string;
  lastName?: string;
  // profilePhoto is handled as a file via @UploadedFile decorator in the controller
}
