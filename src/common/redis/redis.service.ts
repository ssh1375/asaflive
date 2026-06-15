import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redis: RedisClientType,
    ) { }


    async getAllKeys() {
        const keys = await this.redis.keys('*');
        return keys;
    }
    async get(key: string) {
        return this.redis.get(key);
    }

    async set(key: string, value: string, ttl?: number) {
        if (ttl) {
            await this.redis.set(key, value, {
                EX: ttl,
            });
            return;
        }

        await this.redis.set(key, value);
    }

    async del(key: string) {
        return this.redis.del(key);
    }

    getClient() {
        return this.redis;
    }
}