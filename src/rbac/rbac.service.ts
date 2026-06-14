import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, RoleSelect, UpdateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, PermissionSelect, UpdatePermissionDto } from './dto/create-permission.dto';
import { CreateDomainDto, DomainSelect } from './dto/create-domain.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
import { UserSelect } from 'src/users/dto/user.dto';
import { User } from 'generated/prisma/client';

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
      select: {
        ...RoleSelect,
        permissions: {
          select: {
            ...PermissionSelect
          }
        }
      },
    });
  }

  async getRoles(paginateDto: PaginationDto) {
    return await this.prisma.role.findMany({
      ...paginateDto.paginate,
      select: {
        ...RoleSelect,
        domain: { select: DomainSelect },
        permissions: { select: PermissionSelect }
      },
    });
  }


  async getRole(id: string) {
    const role = await this.prisma.role.findFirstOrThrow({
      where: { id },
      select: {
        ...RoleSelect,
        domain: { select: DomainSelect },
        permissions: { select: PermissionSelect }
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
      select: {
        ...RoleSelect,
        domain: { select: DomainSelect },
        permissions: { select: PermissionSelect }
      },
    });
  }


  // ── Permissions ────────────────────────────────────────
  async createPermission(dto: CreatePermissionDto) {
    return await this.prisma.permission.create({
      data: { ...dto },
      select: PermissionSelect
    });
  }

  async getPermissions(paginateDto: PaginationDto) {
    return await this.prisma.permission.findMany({
      ...paginateDto.paginate,
      select: PermissionSelect
    });
  }

  async getPermission(id: string) {
    return await this.prisma.permission.findFirstOrThrow({ where: { id }, select: PermissionSelect });
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    return await this.prisma.permission.update({
      where: { id },
      data: dto,
      select: PermissionSelect
    });
  }

  // ── User Role Assignment ───────────────────────────────
  async assignRoleToUser(userId: string, roleIds: string[]) {
    console.log('Assigning roles', roleIds, 'to user', userId);
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        roles: {
          set: roleIds.map(roleId => ({ id: roleId }))
        }
      },
      select: {
        ...UserSelect,
        roles: {
          select: {
            ...RoleSelect,
            permissions: {
              select: PermissionSelect
            }
          }
        }
      }
    });
  }


  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
      select: {
        roles: {
          select: {
            ...RoleSelect,
            domain: {
              select: DomainSelect
            },
            permissions: {
              select: PermissionSelect
            }
          }
        }
      }
    });
    return user;
  }

  async createDomain(dto: CreateDomainDto) {
    return await this.prisma.domain.create({
      data: dto,
      select: DomainSelect
    });
  }


  async getDomains(paginateDto: PaginationDto) {
    return await this.prisma.domain.findMany({
      skip: paginateDto.skip,
      take: paginateDto.limit,
      select: DomainSelect
    });
  }


}
