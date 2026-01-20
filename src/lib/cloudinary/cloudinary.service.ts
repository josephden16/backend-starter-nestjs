import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';
import { ConfigServiceType } from 'src/config';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService<ConfigServiceType>) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'backend_images',
  ): Promise<{ url: string; size: number; type: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) {
            resolve({
              url: result.secure_url,
              size: result.bytes,
              type: result.resource_type,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        },
      );

      this.bufferToStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string = 'backend_images',
  ): Promise<{ url: string; size: number; type: string }[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = this.extractPublicId(imageUrl);
    if (!publicId) {
      throw new Error('Invalid image URL');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, _) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }

  private extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex((part) => part === 'upload');
      if (uploadIndex === -1) return null;

      const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
      const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
      return publicId;
    } catch {
      return null;
    }
  }
}
