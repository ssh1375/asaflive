import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { SyncPermissionsDto } from './dto/assing-permission.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';
// import { RequirePermissions } from '../auth/decorators/permissions.decorator';



// @UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rbac')
export class RbacController {
  constructor(private rbacService: RbacService) { }

  // ── Roles ──────────────────────────────────────────────
  @Post('roles')
  //   @RequirePermissions('roles:create')
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.rbacService.createRole(dto);
  }

  @Get('roles')
  //   @RequirePermissions('roles:read')
  async getRoles() {
    return await this.rbacService.getRoles();
  }

  @Get('roles/:id')
  //   @RequirePermissions('roles:read')
  async getRole(@Param('id') id: string) {
    return await this.rbacService.getRole(id);
  }

  @Put('roles/:id')
  //   @RequirePermissions('roles:update')
  async updateRole(@Param('id') id: string, @Body() dto: CreateRoleDto) {
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
  async getPermissions() {
    return await this.rbacService.getPermissions();
  }

  @Get('permissions/:id')
  //   @RequirePermissions('permissions:read')
  async getPermission(@Param('id') id: string) {
    return await this.rbacService.getPermission(id);
  }

  @Put('permissions/:id')
  //   @RequirePermissions('permissions:update')
  async updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return await this.rbacService.updatePermission(id, dto);
  }


}
