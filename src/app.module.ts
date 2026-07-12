import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './common/redis/redis.module';
import { LivekitModule } from './livekit/livekit.module';
import { SessionManagerModule } from './session-manager/session-manager.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true
  }), RbacModule, UsersModule, AuthModule, RedisModule, LivekitModule, SessionManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }