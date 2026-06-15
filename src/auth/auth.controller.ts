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
        const saveSession = promisify(req.session.save).bind(req.session);

        req.session['userId'] = user.id;

        console.log(req.sessionID);


        await saveSession();

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


    @Get('me')
    // just authenticate the user
    @UseGuards(SessionAuthGuard)
    async me(@Req() req: Request) {
        const user = req['user'] as any;
        return await this.userService.findOne(user.id);
    }

}
