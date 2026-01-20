import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('API');

  use(req: Request, res: Response, next: NextFunction) {
    morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
      stream: {
        write: (message) => {
          this.logger.log(message);
        },
      },
    })(req, res, next);
  }
}
