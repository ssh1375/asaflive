import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';



export class CreatePermissionDto {
  @IsString() name: string;
  @IsString() @IsOptional() description: string;
}



export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { }
