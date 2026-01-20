import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import util from 'util';
import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'verbose';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const fileFormat = format.combine(
      format.timestamp(),
      format.json(),
      format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta,
        });
      }),
    );

    const consoleFormat = format.combine(
      format.colorize({
        all: true,
      }),
      format.timestamp(),
      format.printf(({ timestamp, level, message, ...meta }) => {
        const { context: formatContext, ...rest } = meta;
        const context = formatContext ? `[${formatContext}] ` : '';
        const trace = meta.trace ? `\nTrace: ${meta.trace}` : '';
        const details =
          rest && Object.keys(rest).length > 0
            ? `\nDetails: ${JSON.stringify(rest)}`
            : '';

        return `${timestamp} ${level}: ${context}${message}${trace} ${details}`;
      }),
    );

    const transportOptions = {
      file: new DailyRotateFile({
        filename: path.join(logDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        auditFile: path.join(logDir, 'audit.json'),
        format: fileFormat,
      }),
      console: new transports.Console({
        format: consoleFormat,
      }),
    };

    this.logger = createLogger({
      level: 'info',
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
      },
      transports: [transportOptions.file, transportOptions.console],
      exceptionHandlers: [transportOptions.file, transportOptions.console],
      exitOnError: false,
    });
  }

  log(message: string, context?: string): void;
  log(message: string, meta?: Record<string, unknown>): void;
  log(...args: unknown[]): void {
    this.write('info', args);
  }

  error(message: string, trace?: string, context?: string): void;
  error(message: string, meta?: Record<string, unknown>): void;
  error(...args: unknown[]): void {
    this.write('error', args);
  }

  warn(message: string, context?: string): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  warn(...args: unknown[]): void {
    this.write('warn', args);
  }

  debug(message: string, context?: string): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  debug(...args: unknown[]): void {
    this.write('debug', args);
  }

  verbose(message: string, context?: string): void;
  verbose(message: string, meta?: Record<string, unknown>): void;
  verbose(...args: unknown[]): void {
    this.write('verbose', args);
  }

  private write(level: LogLevel, args: unknown[]) {
    const { message, meta } = this.normalizeArgs(args);
    if (meta) {
      this.logger[level](message, meta);
    } else {
      this.logger[level](message);
    }
  }

  private normalizeArgs(args: unknown[]): {
    message: string;
    meta?: Record<string, unknown>;
  } {
    if (!args.length) {
      return { message: '' };
    }

    const formatArgs: unknown[] = [];
    const metaAggregate: Record<string, unknown> = {};

    args.forEach((arg) => {
      if (this.isPlainObject(arg)) {
        Object.assign(metaAggregate, arg as Record<string, unknown>);
      } else if (arg instanceof Error) {
        metaAggregate.error = {
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
        };
      }
      formatArgs.push(arg);
    });

    const message = util.formatWithOptions(
      { depth: null, colors: false },
      ...formatArgs,
    );

    const meta = Object.keys(metaAggregate).length ? metaAggregate : undefined;

    return { message, meta };
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }
}
