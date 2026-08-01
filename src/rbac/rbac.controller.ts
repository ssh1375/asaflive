import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Patch } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { SyncPermissionsDto } from './dto/assing-permission.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
import { RequirePermissions } from 'src/auth/permission-decorator';
import { SessionAuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/auth/permission.guard';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';
// import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('rbac')
export class RbacController {
  constructor(private rbacService: RbacService) { }

  // ── Domains ──────────────────────────────────────────────
  @Post('domains')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:domain-create')
  async create(@Body() dto: CreateDomainDto) {
    return await this.rbacService.createDomain(dto);
  }


  @Get('domains')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:domain-showAll')
  async getDomains(@Query() paginateDto: PaginationDto) {
    return await this.rbacService.getDomains(paginateDto);
  }

  // ── Roles ──────────────────────────────────────────────
  @Post('roles')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:role-create')
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.rbacService.createRole(dto);
  }

  @Get('roles')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:role-showAll')
  async getRoles(@Query() paginateDto: PaginationDto) {
    return await this.rbacService.getRoles(paginateDto);
  }

  @Get('roles/:id')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:role-showAll')
  async getRole(@Param('id') id: string) {
    return await this.rbacService.getRole(id);
  }

  @Patch('roles/:id')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:role-update')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return await this.rbacService.updateRole(id, dto);
  }

  // ── Permissions ────────────────────────────────────────
  @Post('permissions')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:permission-create')
  async createPermission(@Body() dto: CreatePermissionDto) {
    return await this.rbacService.createPermission(dto);
  }

  @Get('permissions')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:permission-showAll')
  async getPermissions(@Query() paginateDto: PaginationDto) {
    return await this.rbacService.getPermissions(paginateDto);
  }

  @Get('permissions/:id')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:permission-showAll')
  async getPermission(@Param('id') id: string) {
    return await this.rbacService.getPermission(id);
  }

  @Patch('permissions/:id')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:permission-update')
  async updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return await this.rbacService.updatePermission(id, dto);
  }

  // ── User Permissions ───────────────────────────────
  @Get('users/:userId/permissions')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:permission-showAll')
  async getUserPermissions(@Param('userId') userId: string) {
    return await this.rbacService.getUserPermissions(userId);
  }


  @Patch('users/:userId/roles')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions('rbac:assign-role')
  async assignRoleToUser(@Param('userId') userId: string, @Body('roleIds') roleIds: string[]) {
    return await this.rbacService.assignRoleToUser(userId, roleIds);
  }


}
