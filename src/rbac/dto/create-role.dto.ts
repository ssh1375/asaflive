import { IsString, IsArray, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRoleDto {
    @IsString() name: string;
    @IsString() domain: string;
    @IsString() description: string;
    @IsArray()
    @IsUUID('4', { each: true })
    permissions: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) { }