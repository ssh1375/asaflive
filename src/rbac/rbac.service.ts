import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { CreateDomainDto } from './dto/create-domain.dto';


@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) { }
  // ── Roles ──────────────────────────────────────────────
  async createRole(dto: CreateRoleDto) {
    // connect permissions by id, if any id not exist throw error
    return await this.prisma.role.create({
      data: {
        ...dto,
        permissions: {
          connect: dto.permissions.map(pid => ({ id: pid })),
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
    const role = await this.prisma.role.findFirstOrThrow({
      where: { id },
      include: {
        permissions: true,
      },
    });
    return role;
  }

  // use CreateDto beacase user must provice permissionIds relations
  async updateRole(id: string, dto: CreateRoleDto) {
    return await this.prisma.role.update({
      where: { id },
      data: {
        ...dto,
        permissions: {
          set: dto.permissions.map((id: string) => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }

  // ── Permissions ────────────────────────────────────────

  async createPermission(dto: CreatePermissionDto) {
    return await this.prisma.permission.create({ data: { ...dto } });
  }

  async getPermissions() {
    return this.prisma.permission.findMany();
  }

  async getPermission(id: string) {
    return await this.prisma.permission.findFirstOrThrow({ where: { id } });
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
  }



  // ── User Role Assignment ───────────────────────────────
  async assignRoleToUser(userId: string, roleIds: string[]) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        roles: {
          set: roleIds.map(roleId => ({ id: roleId }))
        }
      }
    });
  }


  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
      select: {
        roles: {
          select: {
            permissions: {
              select: { name: true }
            }
          }
        }
      }
    });

    const permissions = [...new Set(
      user.roles.flatMap(r => r.permissions.map(p => p.name))
    )];
    return permissions;
  }


  async createDomain(dto: CreateDomainDto) {
    return await this.prisma.domain.create({
      data: dto
    });
  }
  async getDomains() {
    return await this.prisma.domain.findMany();
  }

}
