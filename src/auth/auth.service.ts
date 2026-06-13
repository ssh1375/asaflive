import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from "bcrypt";
import { User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';




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

        const payload = {

        }
        this.jwtService.signAsync(payload, {
            secret: process.env.SECRET,
            expiresIn: "15m"
        });
            this.jwtService.signAsync(jwtPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '3650d', // Roughly 10 years
      })

    }
}
