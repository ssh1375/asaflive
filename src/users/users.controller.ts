import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from './dto/paginate.dto';
import { RequirePermissions } from 'src/auth/permission-decorator';
import { Reflector } from '@nestjs/core';
import { SessionAuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/auth/permission.guard';





@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService
    ) { }


    @Post()
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('user:create')
    async create(@Body() dto: CreateUserDto) {
        return await this.userService.create(dto);
    }

    @Get()
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('user:show')
    async findAll(@Query() paginateDto: PaginationDto) {
        return await this.userService.findAll(paginateDto);
    }

    @Get(':id')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('user:show')
    async findOne(@Param('id') id: string) {
        return await this.userService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('user:update')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.userService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('user:delete')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

}
