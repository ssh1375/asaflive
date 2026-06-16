import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permission-decorator';

// Note: Replace these with your actual service imports
import { RedisService } from 'src/common/redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly redisService: RedisService,
        private readonly prismaService: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext) {

        // 1. Get required permissions from the controller handler or class
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );
        console.log(requiredPermissions, ' required per');

        // If no permissions are required, allow access
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        // 2. Get the user attached to the session
        const request = context.switchToHttp().getRequest();

        // Using express-session, we access the session directly.
        // If your session is attached differently (e.g., req.sess), adjust accordingly.
        const session = request.session;

        if (!session || !session.userId) {
            throw new UnauthorizedException('User is not authenticated');
        }

        const cacheKey = `user:${session.userId}:permissions`;

        const permissions = await this.redisService.get(cacheKey);

        let userPermissions: string[];
        // if permisiin is [] go else if permision has items go else if it is undefined or null fetch from db
        if (!permissions) {
            const user = await this.prismaService.user.findFirstOrThrow({
                where: {
                    id: session.userId
                },
                include: {
                    roles: {
                        include: {
                            permissions: true
                        }
                    }
                }
            });
            userPermissions = user.roles.flatMap(role =>
                role.permissions.map(p => p.name)
            );
            console.log('permision not exit for user in redis created. ', cacheKey, JSON.stringify(userPermissions));
            await this.redisService.set(cacheKey, JSON.stringify([...new Set(userPermissions)]));

        } else {
            userPermissions = JSON.parse(permissions);
            console.log("permision is exist ", userPermissions);
        }

        // not check permisions to be mathced.

        for (const rPermission of requiredPermissions) {
            if (!userPermissions.includes(rPermission)) {
                return false;
            }
        }
        return true;
    }
}
