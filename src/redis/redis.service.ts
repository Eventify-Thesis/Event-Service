import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = new Redis({ host, port });
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.setex(key, ttl, value);
    }
    return this.client.set(key, value);
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      throw error;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}:`, error);
      throw error;
    }
  }

  async incrBy(key: string, value: number): Promise<number> {
    try {
      return await this.client.incrby(key, value);
    } catch (error) {
      this.logger.error(
        `Error incrementing by value ${value} for key ${key}:`,
        error,
      );
      throw error;
    }
  }

  async decrBy(key: string, value: number): Promise<number> {
    try {
      return await this.client.decrby(key, value);
    } catch (error) {
      this.logger.error(
        `Error decrementing by value ${value} for key ${key}:`,
        error,
      );
      throw error;
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(
        `Error setting hash field ${field} for key ${key}:`,
        error,
      );
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(
        `Error getting hash field ${field} for key ${key}:`,
        error,
      );
      throw error;
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.client.hdel(key, field);
    } catch (error) {
      this.logger.error(
        `Error deleting hash field ${field} for key ${key}:`,
        error,
      );
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Error getting all hash fields for key ${key}:`, error);
      throw error;
    }
  }

  async setWithLock(key: string, value: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.set(key, value, 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Error setting key ${key} with lock:`, error);
      throw error;
    }
  }
}
