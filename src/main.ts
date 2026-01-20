import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedisStore } from 'connect-redis';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { AppModule } from './app.module';
import { ConfigServiceType, EnviromentsEnum } from './config';
import {
  SWAGGER_ADMIN_ACCESS_TOKEN,
  SWAGGER_ADMIN_REFRESH_TOKEN,
  SWAGGER_USER_ACCESS_TOKEN,
  SWAGGER_USER_REFRESH_TOKEN,
} from './constants/global';
import { ZodFilter } from './filters/zod.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { createRedisConnection } from './lib/redis';
import { CustomLogger } from './shared/logger/logger.service';

declare const module: {
  hot?: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: new CustomLogger(),
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ZodFilter());
  app.enableCors({ origin: '*', allowedHeaders: '*' });
  app.use(cookieParser());
  app.use(helmet());

  const redisClient = await createRedisConnection();
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'backend:',
  });
  app.set('trust proxy', 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      store: redisStore,
    }),
  );

  const configService = app.get(ConfigService<ConfigServiceType>);
  const port = configService.get('PORT');
  const enviroment = configService.get('NODE_ENV');
  if (enviroment !== EnviromentsEnum.Production) {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('Backend API Documentation')
      .setVersion('1.0')
      .addServer('/api/v1')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        SWAGGER_USER_ACCESS_TOKEN,
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        SWAGGER_USER_REFRESH_TOKEN,
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        SWAGGER_ADMIN_ACCESS_TOKEN,
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        SWAGGER_ADMIN_REFRESH_TOKEN,
      )
      .setExternalDoc('Postman Collection', '/swagger-json')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: true,
    });
    const cleaned = cleanupOpenApiDoc(document);
    SwaggerModule.setup('swagger', app, cleaned, {
      customSiteTitle: 'API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });
  }

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(port ?? 8008);
}
bootstrap();
