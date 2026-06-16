import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, RoleSelect, UpdateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, PermissionSelect, UpdatePermissionDto } from './dto/create-permission.dto';
import { CreateDomainDto, DomainSelect } from './dto/create-domain.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
import { UserSelect } from 'src/users/dto/user.dto';
import { User } from 'generated/prisma/client';
import { RedisService } from 'src/common/redis/redis.service';
import { permission } from 'process';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService, private redisService: RedisService) { }
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
  async updateRole(id: string, dto: UpdateRoleDto) {
    const { permissions, ...others } = dto;
    if (permissions && permissions.length) {
      others['permissions'] = {
        set: permissions.map((id: string) => ({ id }))
      }
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: { ...others, },
      select: {
        ...RoleSelect,
        domain: { select: DomainSelect },
        permissions: { select: PermissionSelect }
      },
    });

    // if(dto.permissions) has been changed
    // any user has this role should update in redis his or her 
    // just del the key update would be done in permission guard
    // you could do update in one place but let user iteself update it with th 
    // name is changed all route work with permision named if change it should be update in redis cache
    if (dto.permissions) {
      const users = await this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              id
            }
          }
        }
      });
      const userPermissionsKey = users.map(user => `user:${user.id}:permissions`);
      await this.redisService.del(userPermissionsKey);
    }

    return role;

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

  // permission saved in redis if update the name user cahced permission should be updated.
  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const permission = await this.prisma.permission.update({
      where: { id },
      data: dto,
      select: PermissionSelect
    });

    const users = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            permissions: {
              some: {
                id
              }
            }
          }
        }
      }
    });

    // just del the key update would be done in permission guard
    // you could do update in one place but let user iteself update it with th 
    // name is changed all route work with permision named if change it should be update in redis cache
    // search about event emiiter ssytem
    if (dto.name) {
      const userPermissionsKey = users.map(user => `user:${user.id}:permissions`);
      await this.redisService.del(userPermissionsKey);
    }
    return permission;
  }

  // ── User Role Assignment ───────────────────────────────
  async assignRoleToUser(userId: string, roleIds: string[]) {
    const user = await this.prisma.user.update({
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

    const userPermissions = user.roles.flatMap(role =>
      role.permissions.map(p => p.name)
    );
    await this.redisService.set(`user:${user.id}:permissions`, JSON.stringify([...new Set(userPermissions)]));

    return userPermissions;
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
      ...paginateDto.paginate,
      select: DomainSelect
    });
  }


}
