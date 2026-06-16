import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Patch } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { SyncPermissionsDto } from './dto/assing-permission.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';
// import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('rbac')
export class RbacController {
  constructor(private rbacService: RbacService) { }

  // ── Domains ──────────────────────────────────────────────
  @Post('domains')
  async create(@Body() dto: CreateDomainDto) {
    return await this.rbacService.createDomain(dto);
  }


  @Get('domains')
  async getDomains(@Query() paginateDto: PaginationDto) {
    return await this.rbacService.getDomains(paginateDto);
  }

  // ── Roles ──────────────────────────────────────────────
  @Post('roles')
  //   @RequirePermissions('roles:create')
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.rbacService.createRole(dto);
  }

  @Get('roles')
  //   @RequirePermissions('roles:read')
  async getRoles(@Query() paginateDto: PaginationDto) {
    return await this.rbacService.getRoles(paginateDto);
  }

  @Get('roles/:id')
  //   @RequirePermissions('roles:read')
  async getRole(@Param('id') id: string) {
    return await this.rbacService.getRole(id);
  }

  @Patch('roles/:id')
  //   @RequirePermissions('roles:update')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return await this.rbacService.updateRole(id, dto);
  }

  // ── Permissions ────────────────────────────────────────
  @Post('permissions')
  //   @RequirePermissions('permissions:create')
  async createPermission(@Body() dto: CreatePermissionDto) {
    return await this.rbacService.createPermission(dto);
  }

  @Get('permissions')
  //   @RequirePermissions('permissions:read')
  async getPermissions(@Query() paginateDto: PaginationDto) {
    return await this.rbacService.getPermissions(paginateDto);
  }

  @Get('permissions/:id')
  //   @RequirePermissions('permissions:read')
  async getPermission(@Param('id') id: string) {
    return await this.rbacService.getPermission(id);
  }

  @Patch('permissions/:id')
  //   @RequirePermissions('permissions:update')
  async updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return await this.rbacService.updatePermission(id, dto);
  }

  // ── User Permissions ───────────────────────────────
  @Get('users/:userId/permissions')
  async getUserPermissions(@Param('userId') userId: string) {
    return await this.rbacService.getUserPermissions(userId);
  }


  @Patch('users/:userId/roles')
  async assignRoleToUser(@Param('userId') userId: string, @Body('roleIds') roleIds: string[]) {
    return await this.rbacService.assignRoleToUser(userId, roleIds);
  }


}
