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



@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async register(dto: CreateUserDto) {
        return await this.userService.create(dto);
    }


    async login(loginDto: LoginDto) {

        const user = await this.userService.findByPhone(loginDto.phone);

        if (!user.isActive) {
            throw new ForbiddenException('User account is not active');
        }

        const passIsValid = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!passIsValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const jwtPayload = {
            username: "sajad"
        }
        const { access_token, refresh_token } = await this.generateTokenWithRsa(jwtPayload);

        return { access_token, refresh_token };
    }


    async generateTokenWithRsa(payload: Object): Promise<{ access_token: string, refresh_token: string }> {

        if (!process.env.JWT_PRIVATE) {
            throw new InternalServerErrorException('JWT private key is not configured');
        }

        const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE.replaceAll('\\n', '\n');

        const [access_token, refresh_token] = await Promise.all([this.jwtService.signAsync({
            ...payload,
            type: "access"
        }, {
            algorithm: 'RS256',
            privateKey: JWT_PRIVATE_KEY,
            expiresIn: '15m'
        }),
        this.jwtService.signAsync({
            ...payload,
            type: "refresh"
        }, {
            algorithm: 'RS256',
            privateKey: JWT_PRIVATE_KEY,
            expiresIn: '3650d'
        })]);
        return { access_token, refresh_token };
    }
}
