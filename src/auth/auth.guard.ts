
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(private readonly redisService: RedisService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const req = context.switchToHttp().getRequest();

        const sessionId = req.sessionID;
        // console.log(sessionId, ' session id for auth');

        if (!sessionId) {
            throw new UnauthorizedException('No session ID');
        }

        const session = await this.redisService.get(`asaflive:session:${sessionId}`);

        if (!session) {
            throw new UnauthorizedException('Session expired');
        }

        return true;
    }

}
