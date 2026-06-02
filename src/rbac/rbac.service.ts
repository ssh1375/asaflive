import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  // ── Roles ──────────────────────────────────────────────

  async createRole(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Role "${dto.name}" already exists`);

    return this.prisma.role.create({ data: dto });
  }

  async getRoles() {
    return await this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async getRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });
    if (!role) throw new NotFoundException(`Role "${id}" not found`);
    return role;
  }

  async updateRole(id: string, dto: CreateRoleDto) {
    await this.getRole(id); // throws if not found

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  // ── Permissions ────────────────────────────────────────

  async createPermission(dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Permission "${dto.name}" already exists`);

    return this.prisma.permission.create({ data: dto });
  }

  async getPermissions() {
    return this.prisma.permission.findMany();
  }

  async getPermission(id: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException(`Permission "${id}" not found`);
    return permission;
  }

  async updatePermission(id: string, dto: CreatePermissionDto) {
    await this.getPermission(id); // throws if not found

    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
  }

  // ── Assign / Revoke ────────────────────────────────────

  async assignPermissionToRole(roleId: string, permissionId: string) {
    await this.getRole(roleId);
    await this.getPermission(permissionId);

    const existing = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    if (existing) throw new ConflictException('Permission already assigned to this role');

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async revokePermissionFromRole(roleId: string, permissionId: string) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    if (!existing) throw new NotFoundException('Permission not assigned to this role');

    return this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }

  // ── Sync (batch replace) ───────────────────────────────

  async syncPermissions(roleId: string, permissionIds: string[]) {
    await this.getRole(roleId);

    const current = await this.prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true },
    });

    const currentIds = new Set(current.map((r) => r.permissionId));
    const newIds = new Set(permissionIds);

    const toAdd = permissionIds.filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !newIds.has(id));

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId, permissionId: { in: toRemove } },
      }),
      this.prisma.rolePermission.createMany({
        data: toAdd.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      }),
    ]);

    return this.getRole(roleId);
  }

  // ── User Role Assignment ───────────────────────────────

  async assignRoleToUser(userId: string, roleId: string) {
    await this.getRole(roleId);

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing) throw new ConflictException('Role already assigned to this user');

    return this.prisma.userRole.create({
      data: { userId, roleId },
    });
  }

  async revokeRoleFromUser(userId: string, roleId: string) {
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!existing) throw new NotFoundException('Role not assigned to this user');

    return this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }

    return [...permissions];
  }
}
