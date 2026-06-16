import {
    Controller, Post, Body,
    HttpCode, HttpStatus,
    Res,
    Req,
    Get,
    UseGuards,
    InternalServerErrorException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/users/users.service';
import { RequirePermissions } from './permission-decorator';
import { SessionAuthGuard } from './auth.guard';
import { promisify } from 'util';
import { RedisService } from 'src/common/redis/redis.service';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';




const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private redis: RedisService,
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        private userService: UserService) {
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: CreateUserDto) {
        return await this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {

        const user = await this.authService.login(dto);;

        req.session['userId'] = user.id;

        const saveSession = promisify(req.session.save).bind(req.session);

        await saveSession();
        console.log(await this.redis.get(`sess:${req.sessionID}`));

        res.send({
            message: "login successfully"
        })
    }


    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refresh_token = req.cookies?.['refresh_token'];
        const payload = await this.authService.verifyRefreshToken(refresh_token);
        res.send({
            payload
        });
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(SessionAuthGuard)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = req.cookies?.[REFRESH_TOKEN];
        // await this.authService.logout(token);
        res.clearCookie(REFRESH_TOKEN, { ...COOKIE_OPTIONS, maxAge: 0 });
        res.clearCookie(ACCESS_TOKEN, { ...COOKIE_OPTIONS, maxAge: 0 });
    }


    @Get('services/permissions')
    async getServicePermissions() {
        const controllers = this.discoveryService.getControllers();
        const permissions = new Set<string>();

        // The metadata key you used in your @RequirePermissions decorator
        // e.g., SetMetadata('permissions', permissions)
        const PERMISSIONS_KEY = 'permissions';

        controllers.forEach((wrapper) => {
            const { instance } = wrapper;
            if (!instance || typeof instance !== 'object') return;

            // Get all methods on the controller prototype
            const prototype = Object.getPrototypeOf(instance);

            this.metadataScanner.getAllMethodNames(prototype).forEach((methodName) => {
                // Read the metadata attached to the method
                const methodPermissions = this.reflector.get<string[]>(
                    PERMISSIONS_KEY,
                    instance[methodName],
                );

                console.log(methodPermissions)

                if (methodPermissions) {
                    methodPermissions.forEach((p) => permissions.add(p));
                }
            });
        });

        return Array.from(permissions);
    }

    @Get('me')
    // just authenticate the user
    @UseGuards(SessionAuthGuard)
    async me(@Req() req: Request) {
        const user = req['user'] as any;
        return await this.userService.findOne(user.id);
    }

}
