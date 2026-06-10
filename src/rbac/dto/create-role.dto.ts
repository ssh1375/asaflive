import { IsString, IsArray, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { RoleSelect as RoleSelectPr } from 'generated/prisma/models';
export class CreateRoleDto {
    @IsString() name: string;
    @IsUUID() domainId: string;
    @IsString() description: string;
    @IsArray()
    @IsUUID('all', { each: true })
    permissions: string[];
}

export const RoleSelect = {
    id: true,
    name: true,
    description: true,
    domain: true
} satisfies RoleSelectPr;

export class UpdateRoleDto extends PartialType(CreateRoleDto) { }