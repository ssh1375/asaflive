import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { connect } from 'node:http2';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) { }
  // ── Roles ──────────────────────────────────────────────
  async createRole(dto: CreateRoleDto) {
    // check all permision id has same domain name
    const mismatchCount = await this.prisma.permission.count({
      where: { id: { in: dto.permissions }, domain: { not: dto.domain } },
    });
    // count if two array not the same some permision not belong to this domain name
    if (mismatchCount > 0) {
      throw new BadRequestException(`All permissions must belong to domain "${dto.domain}"`);
    }

    return await this.prisma.role.create({
      data: {
        ...dto,
        permissions: {
          connect: dto.permissions.map(perID => ({ id: perID })),
        },
      },
      include: { permissions: true },
    });
  }

  async getRoles() {
    return await this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    });
  }

  async getRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
    if (!role) throw new NotFoundException(`Role "${id}" not found`);
    return role;
  }

  // use CreateDto beacase user must provice permissionIds relations
  async updateRole(id: string, dto: CreateRoleDto) {
    // check all permision id has same domain name
    const mismatchCount = await this.prisma.permission.count({
      where: { id: { in: dto.permissions }, domain: { not: dto.domain } },
    });
    // count if two array not the same some permision not belong to this domain name
    if (mismatchCount > 0) {
      throw new BadRequestException(`All permissions must belong to domain "${dto.domain}"`);
    }

    return await this.prisma.role.update({
      where: { id },
      data: {
        ...dto,
        permissions: {
          set: dto.permissions.map((pid: string) => ({ id: pid })),
        },
      },
      include: { permissions: true },
    });
  }

  // ── Permissions ────────────────────────────────────────

  async createPermission(dto: CreatePermissionDto) {
    return await this.prisma.permission.create({ data: dto });
  }

  async getPermissions() {
    return this.prisma.permission.findMany();
  }

  async getPermission(id: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException(`Permission "${id}" not found`);
    return permission;
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    await this.getPermission(id); // throws if not found

    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
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
    // const userRoles = await this.prisma.userRole.findMany({
    //   where: { userId },
    //   include: {
    //     role: {
    //       include: {
    //         permissions: true,
    //       },
    //     },
    //   },
    // });

    const permissions = new Set<string>();
    // for (const ur of userRoles) {
    //   for (const rp of ur.role.permissions) {
    //     permissions.add(rp.permission.name);
    //   }
    // }

    return [...permissions];
  }
}
