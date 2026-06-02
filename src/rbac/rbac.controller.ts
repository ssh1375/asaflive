import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { SyncPermissionsDto } from './dto/assing-permission.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';
// import { RequirePermissions } from '../auth/decorators/permissions.decorator';




// @UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rbac')
export class RbacController {
  constructor(private rbacService: RbacService) {}

  // ── Roles ──────────────────────────────────────────────
  @Post('roles')
//   @RequirePermissions('roles:create')
  createRole(@Body() dto: CreateRoleDto) {
    // return this.rbacService.createRole(dto);
  }

  @Get('roles')
//   @RequirePermissions('roles:read')
  getRoles() {
    // return this.rbacService.getRoles();
  }

  @Get('roles/:id')
//   @RequirePermissions('roles:read')
  getRole(@Param('id') id: string) {
    // return this.rbacService.getRole(id);
  }

  @Put('roles/:id')
//   @RequirePermissions('roles:update')
  updateRole(@Param('id') id: string, @Body() dto: CreateRoleDto) {
    // return this.rbacService.updateRole(id, dto);
  }

  // ── Permissions ────────────────────────────────────────
  @Post('permissions')
//   @RequirePermissions('permissions:create')
  createPermission(@Body() dto: CreatePermissionDto) {
    // return this.rbacService.createPermission(dto);
  }

  @Get('permissions')
//   @RequirePermissions('permissions:read')
  getPermissions() {
    // return this.rbacService.getPermissions();
  }

  @Get('permissions/:id')
//   @RequirePermissions('permissions:read')
  getPermission(@Param('id') id: string) {
    // return this.rbacService.getPermission(id);
  }

  @Put('permissions/:id')
//   @RequirePermissions('permissions:update')
  updatePermission(@Param('id') id: string, @Body() dto: CreatePermissionDto) {
    // return this.rbacService.updatePermission(id, dto);
  }

  // ── Assign / Revoke ────────────────────────────────────
  @Post('roles/:roleId/permissions')
//   @RequirePermissions('roles:update')
  assign(@Param('roleId') roleId: string, @Body() dto: SyncPermissionsDto) {
    // return this.rbacService.assignPermissionToRole(roleId, dto.permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
//   @RequirePermissions('roles:update')
  revoke(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    // return this.rbacService.revokePermissionFromRole(roleId, permissionId);
  }


}
