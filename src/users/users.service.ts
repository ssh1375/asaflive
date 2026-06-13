import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserSelect } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from './dto/paginate.dto';


@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto) {

        const { password, ...data } = dto;
        // make password hashed
        return await this.prisma.user.create({
            data: {
                ...data,
                passwordHash: await bcrypt.hash(password, Number(process.env.SALT_ROUND) || 12)
            },
            select: UserSelect
        });
    }

    async findAll(paginateDto: PaginationDto) {
        return await this.prisma.user.findMany({
            skip: paginateDto.skip,
            take: paginateDto.limit,
            select: UserSelect
        });
    }

    async findByPhone(phone: string) {
        return await this.prisma.user.findFirstOrThrow({
            where: {
                phone
            }
        });
    }


    async findOne(id: string) {
        return await this.prisma.user.findFirstOrThrow({ where: { id }, select: UserSelect });
    }

    async update(id: string, dto: UpdateUserDto) {
        return await this.prisma.user.update({ where: { id }, data: dto, select: UserSelect });
    }

    async remove(id: string) {
        return await this.prisma.user.delete({ where: { id }, select: UserSelect });
    }
}
