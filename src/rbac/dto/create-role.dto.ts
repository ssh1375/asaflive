import { IsString, IsArray, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRoleDto {
    @IsString() name: string;
    @IsUUID() domainId: string;
    @IsString() description: string;
    @IsArray()
    @IsUUID('all', { each: true })
    permissions: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) { }