import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        return await this.prisma.user.create({ data: dto });
    }

    async findAll() {
        return await this.prisma.user.findMany();
    }

    async findOne(id: string) {
        return await this.prisma.user.findFirstOrThrow({ where: { id } });
    }

    async update(id: string, dto: UpdateUserDto) {
        return await this.prisma.user.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        return await this.prisma.user.delete({ where: { id } });
    }
}
