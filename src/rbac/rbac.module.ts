import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { DiscoveryPermissionService } from './permissions-discovery.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
// import { PermissionsDiscoveryService } from './permissions-discovery.service';

@Module({
  providers: [RbacService, DiscoveryPermissionService, PrismaService, Reflector, MetadataScanner, DiscoveryService],
  controllers: [RbacController]
})
export class RbacModule { }
