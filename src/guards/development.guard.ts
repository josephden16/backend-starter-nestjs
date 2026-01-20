import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigServiceType, EnviromentsEnum } from 'src/config';

@Injectable()
export class DevelopmentGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<ConfigServiceType, true>,
  ) {}

  canActivate(): boolean {
    const environment = this.configService.get<string>('NODE_ENV');
    const isDevelopment = environment === EnviromentsEnum.Development;

    if (!isDevelopment) {
      throw new ForbiddenException(
        'This endpoint is only available in development mode',
      );
    }

    return true;
  }
}
