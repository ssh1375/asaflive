import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PermissionSelect as PermissionSelectt } from 'generated/prisma/models';


export class CreatePermissionDto {
  @IsString() name: string;
  @IsString() @IsOptional() description: string;
}



export const PermissionSelect = {
  id: true,
  name: true,
  description: true
} satisfies PermissionSelectt;

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { }
