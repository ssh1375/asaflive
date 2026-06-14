import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
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

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Extract required permissions from the route handler
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no permissions are required, allow access
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        // 2. Get the user payload attached by AuthGuard
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Usually contains { sub: userId, type: 'access', ... }

        if (!user || !user.sub) {
            throw new ForbiddenException('Invalid user context');
        }

        // 3. Attempt to get user session data from Redis
        const cacheKey = `user:${user.sub}:sessionData`;
        let sessionDataStr = await this.redisService.get(cacheKey);
        let sessionData;

        if (sessionDataStr) {
            // Cache Hit
            sessionData = JSON.parse(sessionDataStr);
        } else {
            // 4. Cache Miss (Lazy Loading): Fetch from DB
            const dbUser = await this.prismaService.user.findUnique({
                where: { id: user.sub },
                select: {
                    isActive: true,
                    // Adjust this based on your actual Prisma schema relation
                    permissions: { select: { name: true } }
                },
            });

            if (!dbUser) {
                throw new ForbiddenException('User not found');
            }

            // Map DB structure to our cached structure
            sessionData = {
                isActive: dbUser.isActive,
                permissions: dbUser.permissions.map(p => p.name),
            };

            // Save to Redis (e.g., expire in 1 hour or keep indefinitely until updated)
            await this.redisService.set(cacheKey, JSON.stringify(sessionData), 3600);
        }

        // 5. Instantly check isActive status
        if (sessionData.isActive !== true) {
            throw new ForbiddenException('Account is disabled');
        }

        // 6. Check if user has ALL required permissions (AND logic)
        // If you want OR logic, use .some() instead of .every()
        const hasPermissions = requiredPermissions.every((permission) =>
            sessionData.permissions.includes(permission),
        );

        if (!hasPermissions) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
