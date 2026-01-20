import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import type { Express } from 'express';
import { ConfigServiceType } from 'src/config';
import { BCRYPT_SALT_ROUNDS, DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/constants';
import { SuccessResponse } from 'src/helpers';
import { CloudinaryService } from 'src/lib/cloudinary/cloudinary.service';
import { PaginationParams } from 'src/shared/dto';
import { CustomLogger } from 'src/shared/logger/logger.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TokenBlacklistService } from 'src/shared/security';
import { parseExpiryToSeconds } from 'src/utils';

import {
  CreateAdminDto,
  UpdateAdminDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLogger,
    private readonly cloudinaryService: CloudinaryService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly config: ConfigService<ConfigServiceType, true>,
  ) {}

  async getAll(params: PaginationParams) {
    this.logger.log('AdminService.getAll called', { params });
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = params;
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isSuper: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admin.count({
        where: { isDeleted: false },
      }),
    ]);

    return SuccessResponse('Admins retrieved successfully', {
      admins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async getById(id: string) {
    this.logger.log('AdminService.getById called', { id });
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin || admin.isDeleted || admin.status === 'DEACTIVATED') {
      throw new NotFoundException('Admin not found');
    }

    const { password: _password, ...adminData } = admin;

    return SuccessResponse('Admin retrieved successfully', {
      admin: adminData,
    });
  }

  async create(dto: CreateAdminDto) {
    this.logger.log('AdminService.create called', { dto });
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (existingAdmin && !existingAdmin.isDeleted) {
      this.logger.error('AdminService.create - email already in use', {
        email: dto.email,
      });
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const newAdmin = await this.prisma.admin.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: hashedPassword,
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isSuper: true,
        createdAt: true,
      },
    });

    this.logger.log('AdminService.create succeeded', { adminId: newAdmin.id });
    return SuccessResponse('Admin created successfully', { admin: newAdmin });
  }

  async update(id: string, dto: UpdateAdminDto) {
    this.logger.log('AdminService.update called', { id, dto });
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin || admin.isDeleted) {
      this.logger.error('AdminService.update - admin not found', { id });
      throw new NotFoundException('Admin not found');
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: {
        firstName: dto.firstName ?? admin.firstName,
        lastName: dto.lastName ?? admin.lastName,
        role: dto.role ?? admin.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isSuper: true,
        updatedAt: true,
      },
    });

    this.logger.log('AdminService.update succeeded', { id });
    return SuccessResponse('Admin updated successfully', {
      admin: updatedAdmin,
    });
  }

  async delete(id: string, currentAdminId: string) {
    this.logger.log('AdminService.delete called', { id, currentAdminId });

    if (id === currentAdminId) {
      this.logger.warn('AdminService.delete - attempted self-deletion', { id });
      throw new BadRequestException('You cannot delete your own account');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      this.logger.error('AdminService.delete - admin not found', { id });
      throw new NotFoundException('Admin not found');
    }

    if (admin.isSuper) {
      this.logger.warn('AdminService.delete - attempted super admin deletion', {
        id,
      });
      throw new BadRequestException(
        'Cannot delete super admin account. Please demote to regular admin first.',
      );
    }

    if (admin.isDeleted) {
      this.logger.warn('AdminService.delete - admin already deleted', { id });
      throw new BadRequestException('Admin is already deleted');
    }

    try {
      const refreshTokenExpiry =
        this.config.get<string>('JWT_REFRESH_EXPIRY_TIME') || '7d';
      const expiryInSeconds = parseExpiryToSeconds(refreshTokenExpiry);
      await this.tokenBlacklist.blacklistAdminTokens(id, expiryInSeconds);
      this.logger.log('AdminService.delete - tokens revoked', { id });
    } catch (error) {
      this.logger.error('AdminService.delete - token revocation failed', error);
    }

    await this.prisma.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    this.logger.log('AdminService.delete succeeded', { id });
    return SuccessResponse('Admin deleted successfully', null);
  }

  async getMe(adminId: string) {
    this.logger.log('AdminService.getMe called', { adminId });
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isSuper: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!admin) {
      this.logger.error('AdminService.getMe - admin not found', { adminId });
      throw new UnauthorizedException('Admin not found');
    }

    this.logger.log('AdminService.getMe succeeded', { adminId });
    return SuccessResponse('Profile retrieved successfully', { admin });
  }

  async updateProfile(
    adminId: string,
    dto: UpdateProfileDto,
    profilePhoto?: Express.Multer.File,
  ) {
    this.logger.log('AdminService.updateProfile called', { adminId, dto });
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      this.logger.error('AdminService.updateProfile - admin not found', {
        adminId,
      });
      throw new UnauthorizedException('Admin not found');
    }

    let profilePhotoUrl = admin.profilePhotoUrl;

    if (profilePhoto) {
      try {
        const uploadedImage = await this.cloudinaryService.uploadImage(
          profilePhoto,
          'backend_admin_profiles',
        );
        profilePhotoUrl = uploadedImage.url;
        this.logger.log('AdminService.updateProfile - photo uploaded', {
          adminId,
          photoUrl: profilePhotoUrl,
        });
      } catch (error) {
        this.logger.error('AdminService.updateProfile - photo upload failed', {
          adminId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new BadRequestException('Failed to upload profile photo');
      }
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        firstName: dto.firstName ?? admin.firstName,
        lastName: dto.lastName ?? admin.lastName,
        profilePhotoUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePhotoUrl: true,
        role: true,
        status: true,
        isSuper: true,
        updatedAt: true,
      },
    });

    this.logger.log('AdminService.updateProfile succeeded', updatedAdmin);
    return SuccessResponse('Profile updated successfully', {
      admin: updatedAdmin,
    });
  }

  async updatePassword(adminId: string, dto: UpdatePasswordDto) {
    this.logger.log('AdminService.updatePassword called', { adminId });
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      this.logger.error('AdminService.updatePassword - admin not found', {
        adminId,
      });
      throw new UnauthorizedException('Admin not found');
    }

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      admin.password,
    );

    if (!passwordMatch) {
      this.logger.error(
        'AdminService.updatePassword - incorrect current password',
        { adminId },
      );
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    this.logger.log('AdminService.updatePassword succeeded', { adminId });
    return SuccessResponse('Password updated successfully', null);
  }

  async toggleStatus(
    id: string,
    action: 'activate' | 'deactivate',
    currentAdminId: string,
  ) {
    this.logger.log('AdminService.toggleStatus called', {
      id,
      action,
      currentAdminId,
    });

    if (action === 'deactivate' && id === currentAdminId) {
      this.logger.warn(
        'AdminService.toggleStatus - attempted self-deactivation',
        { id },
      );
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin || admin.isDeleted) {
      this.logger.error('AdminService.toggleStatus - admin not found', { id });
      throw new NotFoundException('Admin not found');
    }

    if (action === 'deactivate' && admin.isSuper) {
      this.logger.warn(
        'AdminService.toggleStatus - attempted super admin deactivation',
        { id },
      );
      throw new BadRequestException(
        'Cannot deactivate super admin account. Please demote to regular admin first.',
      );
    }

    const newStatus = action === 'activate' ? 'ACTIVE' : 'DEACTIVATED';
    if (admin.status === newStatus) {
      throw new BadRequestException(
        `Admin is already ${newStatus.toLowerCase()}`,
      );
    }

    if (action === 'deactivate') {
      try {
        const refreshTokenExpiry =
          this.config.get<string>('JWT_REFRESH_EXPIRY_TIME') || '7d';
        const expiryInSeconds = parseExpiryToSeconds(refreshTokenExpiry);
        await this.tokenBlacklist.blacklistAdminTokens(id, expiryInSeconds);
        this.logger.log('AdminService.toggleStatus - tokens revoked', { id });
      } catch (error) {
        this.logger.error(
          'AdminService.toggleStatus - token revocation failed',
          error,
        );
      }
    }

    if (action === 'activate') {
      try {
        await this.tokenBlacklist.removeAdminFromBlacklist(id);
        this.logger.log('AdminService.toggleStatus - blacklist cleared', {
          id,
        });
      } catch (error) {
        this.logger.error(
          'AdminService.toggleStatus - blacklist removal failed',
          error,
        );
      }
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isSuper: true,
        updatedAt: true,
      },
    });

    this.logger.log('AdminService.toggleStatus succeeded', { id, action });
    return SuccessResponse(`Admin ${action}d successfully`, {
      admin: updatedAdmin,
    });
  }
}
