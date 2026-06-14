import {
    Controller, Post, Body,
    HttpCode, HttpStatus,
    Res,
    Req,
    Get,
    UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/users/users.service';
import { RequirePermissions } from './permission-decorator';
import { AuthGuard } from './auth.guard';

const REFRESH_COOKIE = 'refresh_token';

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
        @Res({ passthrough: true }) res: Response,
    ) {

        const { access_token, refresh_token } = await this.authService.login(dto);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
            path: '/',
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years in milliseconds
            path: '/auth/refresh', // OPTIONAL: Restrict to refresh endpoint to save bandwidth
        });

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

    // @Post('logout')
    // @HttpCode(HttpStatus.NO_CONTENT)
    // @UseGuards(JwtAuthGuard)
    // async logout(
    //     @Req() req: Request,
    //     @Res({ passthrough: true }) res: Response,
    // ) {
    //     const token = req.cookies?.[REFRESH_COOKIE];
    //     await this.authService.logout(token);
    //     res.clearCookie(REFRESH_COOKIE, { ...COOKIE_OPTIONS, maxAge: 0 });
    // }


    @Get('me')
    @UseGuards(AuthGuard)
    // @RequirePermissions('user:me')
    async me(@Req() req: Request) {
        const user = req['user'] as any;
        return await this.userService.findOne(user.id);
    }

}
