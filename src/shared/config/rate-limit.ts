import { hours, minutes, seconds } from '@nestjs/throttler';

export const rateLimitConfig = {
  global: {
    name: 'default',
    ttl: seconds(60),
    limit: 100,
  },
  auth: {
    default: {
      ttl: seconds(60),
      limit: 10,
    },
    register: {
      ttl: seconds(60),
      limit: 5,
    },
    login: {
      ttl: seconds(60),
      limit: 5,
    },
    forgotPassword: {
      ttl: hours(1),
      limit: 3,
    },
    verification: {
      ttl: minutes(5),
      limit: 5,
    },
  },
};
