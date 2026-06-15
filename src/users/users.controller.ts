import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from './dto/paginate.dto';
import { RequirePermissions } from 'src/auth/permission-decorator';
import { Reflector } from '@nestjs/core';
import { SessionAuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly reflector: Reflector // 2. Inject Reflector into the constructor
    ) { }


    @Post()
    @RequirePermissions('user:create')
    @UseGuards(SessionAuthGuard)
    async create(@Body() dto: CreateUserDto) {
        return await this.userService.create(dto);
    }

    @Get()
    async findAll(@Query() paginateDto: PaginationDto) {
        return await this.userService.findAll(paginateDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.userService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.userService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

}
