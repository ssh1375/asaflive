import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: async () => {
                const client = createClient({
                    socket: {
                        host: process.env.REDIS_HOST,
                        port: Number(process.env.REDIS_PORT),
                    },
                    password: process.env.REDIS_PASSWORD,
                });

                client.on('error', (err) => {
                    console.error('Redis Error', err);
                });

                await client.connect();

                return client;
            },
        },
        RedisService,
    ],
    exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }