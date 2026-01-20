import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Express } from 'express';
import {
  MAX_PROFILE_PHOTO_SIZE_MB,
  SUPPORTED_PROFILE_PHOTO_FORMATS,
  SWAGGER_ADMIN_ACCESS_TOKEN,
} from 'src/constants';
import { PaginationQueryDto } from 'src/shared/dto';
import {
  GetAllAdminsDocs,
  GetMeDocs,
  GetAdminByIdDocs,
  CreateAdminDocs,
  UpdateAdminDocs,
  DeleteAdminDocs,
  UpdateProfileDocs,
  UpdatePasswordDocs,
  ToggleAdminStatusDocs,
} from 'src/docs/admin/admin.docs';

import { AdminService } from './admin.service';
import {
  CreateAdminDto,
  UpdateAdminDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto';
import {
  AllowAuthenticatedAdmin,
  AuthenticatedAdmin,
  GetAdmin,
} from '../../shared/auth';

@ApiTags('Admin Management')
@ApiBearerAuth(SWAGGER_ADMIN_ACCESS_TOKEN)
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @AllowAuthenticatedAdmin('ADMIN', 'MODERATOR')
  @GetAllAdminsDocs()
  async getAll(@Query() query: PaginationQueryDto) {
    return this.adminService.getAll(query);
  }

  @Get('me')
  @AllowAuthenticatedAdmin('ADMIN', 'MODERATOR')
  @GetMeDocs()
  async getMe(@GetAdmin() admin: AuthenticatedAdmin | undefined) {
    return this.adminService.getMe(admin?.id || '');
  }

  @Get(':id')
  @AllowAuthenticatedAdmin('ADMIN', 'MODERATOR')
  @GetAdminByIdDocs()
  async getById(@Param('id') id: string) {
    return this.adminService.getById(id);
  }

  @Post()
  @AllowAuthenticatedAdmin('ADMIN')
  @CreateAdminDocs()
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Put(':id')
  @AllowAuthenticatedAdmin('ADMIN')
  @UpdateAdminDocs()
  async update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(id, dto);
  }

  @Delete(':id')
  @AllowAuthenticatedAdmin('ADMIN')
  @DeleteAdminDocs()
  async delete(
    @Param('id') id: string,
    @GetAdmin() currentAdmin: AuthenticatedAdmin | undefined,
  ) {
    return this.adminService.delete(id, currentAdmin?.id || '');
  }

  @Put('me/profile')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  @AllowAuthenticatedAdmin('ADMIN', 'MODERATOR')
  @UpdateProfileDocs()
  async updateProfile(
    @GetAdmin() admin: AuthenticatedAdmin | undefined,
    @Body() dto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PROFILE_PHOTO_SIZE_MB }),
          new FileTypeValidator({ fileType: SUPPORTED_PROFILE_PHOTO_FORMATS }),
        ],
        fileIsRequired: false,
      }),
    )
    profilePhoto?: Express.Multer.File,
  ) {
    return this.adminService.updateProfile(admin?.id || '', dto, profilePhoto);
  }

  @Put('me/password')
  @AllowAuthenticatedAdmin('ADMIN', 'MODERATOR')
  @UpdatePasswordDocs()
  async updatePassword(
    @GetAdmin() admin: AuthenticatedAdmin | undefined,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.adminService.updatePassword(admin?.id || '', dto);
  }

  @Put(':id/status')
  @AllowAuthenticatedAdmin('ADMIN')
  @ToggleAdminStatusDocs()
  async toggleStatus(
    @Param('id') id: string,
    @Query('action') action: 'activate' | 'deactivate',
    @GetAdmin() currentAdmin: AuthenticatedAdmin | undefined,
  ) {
    if (!['activate', 'deactivate'].includes(action)) {
      throw new Error('Invalid action');
    }
    return this.adminService.toggleStatus(id, action, currentAdmin?.id || '');
  }
}
