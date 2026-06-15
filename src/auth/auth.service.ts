import { ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from "bcrypt";
import { User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import fs from "fs/promises"
import { RedisService } from 'src/common/redis/redis.service';



@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        private jwtService: JwtService,
        private redisServer: RedisService
    ) { }


    async register(dto: CreateUserDto) {
        const user = await this.userService.create(dto);
        return user;
    }

    async login(loginDto: LoginDto) {
        const user = await this.userService.findByPhone(loginDto.phone);

        // check if user not active
        if (!user.isActive) {
            throw new ForbiddenException('User account is not active');
        }

        const passIsValid = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!passIsValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }



    // async verifyToken(key: string, token: string, token_type: 'refresh' | 'access') {

    // }
    async verifyRefreshToken(refresh_token: string) {
        if (!process.env.JWT_PUBLIC) {
            throw new InternalServerErrorException("public key not exist");
        }
        const payload = await this.jwtService.verifyAsync(refresh_token);
        if (payload.type != 'refresh') {
            throw new UnauthorizedException('Invalid token type');
        }
        return payload;
    }

    async generateTokenWithRsa(payload: Object): Promise<{ access_token: string, refresh_token: string }> {

        if (!process.env.JWT_PRIVATE) {
            throw new InternalServerErrorException('JWT private key is not configured');
        }
        const [access_token, refresh_token] = await Promise.all(
            [this.jwtService.signAsync({ ...payload, type: "access" }), this.jwtService.signAsync({ ...payload, type: "refresh" })]
        );
        return { access_token, refresh_token };
    }
}
