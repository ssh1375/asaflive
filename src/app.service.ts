import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

import { User } from 'generated/prisma/client'
import { RedisService } from './common/redis/redis.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService, private redisServer: RedisService) { }
  async pingRedis() {
    return await this.redisServer.getClient().ping();
  }
}
