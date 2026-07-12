import { IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';




class PermissionsDto {
    @IsBoolean()
    @IsNotEmpty()
    roomJoin: boolean;

    @IsBoolean()
    @IsNotEmpty()
    canPublish: boolean;

    @IsBoolean()
    @IsNotEmpty()
    canSubscribe: boolean;
}



export class InviteMeetingDto {

    @IsString()
    @IsNotEmpty()
    displayName: string;

    @IsOptional()
    @IsString()
    userId: string;

    @IsNumberString()
    phone: string;


    @IsObject()
    @IsNotEmpty()
    @Type(() => PermissionsDto) // ضروری برای تبدیل آبجکت ساده به کلاس

    @IsObject()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => PermissionsDto) // ضروری برای تبدیل آبجکت ساده به کلاس
    permissions: PermissionsDto;

}


