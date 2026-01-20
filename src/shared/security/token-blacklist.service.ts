import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { ConfigServiceType } from 'src/config';
import { CustomLogger } from 'src/shared/logger/logger.service';

/**
 * Service for managing token revocation using Redis.
 * Maintains a blacklist of revoked tokens to prevent their further use.
 */
@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private redisClient: ReturnType<typeof createClient>;

  constructor(
    private readonly config: ConfigService<ConfigServiceType, true>,
    private readonly logger: CustomLogger,
  ) {}

  async onModuleInit() {
    try {
      this.redisClient = createClient({
        username: 'default',
        password: this.config.get<string>('REDIS_PASSWORD'),
        socket: {
          host: this.config.get<string>('REDIS_HOST'),
          port: parseInt(this.config.get<string>('REDIS_PORT') || '6379'),
          connectTimeout: 10000,
        },
      });

      this.redisClient.on('error', (err) =>
        this.logger.error('Redis Client Error', err),
      );

      await this.redisClient.connect();
      this.logger.log('TokenBlacklistService - Redis connected successfully');
    } catch (error) {
      this.logger.error('TokenBlacklistService - Redis connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => {});
      this.logger.log('TokenBlacklistService - Redis disconnected');
    }
  }

  /**
   * Blacklist a token by storing it in Redis with its expiration time.
   * The token will be automatically removed from Redis after it expires.
   * @param token - The JWT token to blacklist
   * @param expiresInSeconds - Time in seconds until the token naturally expires
   */
  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    try {
      const key = `blacklist:${token}`;
      await this.redisClient.setEx(key, expiresInSeconds, '1');
      this.logger.log('TokenBlacklistService - Token blacklisted', {
        tokenPrefix: token.substring(0, 20),
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      this.logger.error('TokenBlacklistService - Failed to blacklist token', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted.
   * @param token - The JWT token to check
   * @returns True if token is blacklisted, false otherwise
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `blacklist:${token}`;
      const result = await this.redisClient.get(key);
      return result !== null;
    } catch (error) {
      this.logger.error('TokenBlacklistService - Failed to check token', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // On Redis error, fail open (allow the token) to prevent blocking all users
      // The token will still be validated by JWT verification
      return false;
    }
  }

  /**
   * Blacklist all tokens for a specific user by their user ID.
   * This is useful when suspending or deleting a user account.
   * @param userId - The user ID whose tokens should be revoked
   * @param expiresInSeconds - Max time any of the user's tokens could be valid
   */
  async blacklistUserTokens(
    userId: string,
    expiresInSeconds: number,
  ): Promise<void> {
    try {
      const key = `blacklist:user:${userId}`;
      await this.redisClient.setEx(key, expiresInSeconds, '1');
      this.logger.log('TokenBlacklistService - User tokens blacklisted', {
        userId,
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      this.logger.error(
        'TokenBlacklistService - Failed to blacklist user tokens',
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }
  }

  /**
   * Check if all tokens for a user are blacklisted.
   * @param userId - The user ID to check
   * @returns True if all user's tokens are blacklisted, false otherwise
   */
  async isUserBlacklisted(userId: string): Promise<boolean> {
    try {
      const key = `blacklist:user:${userId}`;
      const result = await this.redisClient.get(key);
      return result !== null;
    } catch (error) {
      this.logger.error(
        'TokenBlacklistService - Failed to check user blacklist',
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      // Fail open on Redis error
      return false;
    }
  }

  /**
   * Remove a user from the blacklist (useful when reactivating an account).
   * @param userId - The user ID to remove from blacklist
   */
  async removeUserFromBlacklist(userId: string): Promise<void> {
    try {
      const key = `blacklist:user:${userId}`;
      await this.redisClient.del(key);
      this.logger.log('TokenBlacklistService - User removed from blacklist', {
        userId,
      });
    } catch (error) {
      this.logger.error(
        'TokenBlacklistService - Failed to remove user from blacklist',
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }
  }

  /**
   * Blacklist all tokens for a specific admin by their admin ID.
   * This is useful when suspending or deleting an admin account.
   * @param adminId - The admin ID whose tokens should be revoked
   * @param expiresInSeconds - Max time any of the admin's tokens could be valid
   */
  async blacklistAdminTokens(
    adminId: string,
    expiresInSeconds: number,
  ): Promise<void> {
    try {
      const key = `blacklist:admin:${adminId}`;
      await this.redisClient.setEx(key, expiresInSeconds, '1');
      this.logger.log('TokenBlacklistService - Admin tokens blacklisted', {
        adminId,
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      this.logger.error(
        'TokenBlacklistService - Failed to blacklist admin tokens',
        {
          adminId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }
  }

  /**
   * Check if all tokens for an admin are blacklisted.
   * @param adminId - The admin ID to check
   * @returns True if all admin's tokens are blacklisted, false otherwise
   */
  async isAdminBlacklisted(adminId: string): Promise<boolean> {
    try {
      const key = `blacklist:admin:${adminId}`;
      const result = await this.redisClient.get(key);
      return result !== null;
    } catch (error) {
      this.logger.error(
        'TokenBlacklistService - Failed to check admin blacklist',
        {
          adminId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      // Fail open on Redis error
      return false;
    }
  }

  /**
   * Remove an admin from the blacklist (useful when reactivating an account).
   * @param adminId - The admin ID to remove from blacklist
   */
  async removeAdminFromBlacklist(adminId: string): Promise<void> {
    try {
      const key = `blacklist:admin:${adminId}`;
      await this.redisClient.del(key);
      this.logger.log('TokenBlacklistService - Admin removed from blacklist', {
        adminId,
      });
    } catch (error) {
      this.logger.error(
        'TokenBlacklistService - Failed to remove admin from blacklist',
        {
          adminId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }
  }
}
