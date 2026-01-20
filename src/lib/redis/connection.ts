/* eslint-disable no-console */

import { createClient } from 'redis';

export const createRedisConnection = async (): Promise<
  ReturnType<typeof createClient>
> => {
  const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(`${process.env.REDIS_PORT}`),
      connectTimeout: 10000,
    },
  });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    await redisClient.quit().catch(() => {});
    throw error;
  }
};
