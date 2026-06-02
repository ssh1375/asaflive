// dto/assign-permission.dto.ts
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';


export class SyncPermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

