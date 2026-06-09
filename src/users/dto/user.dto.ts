import { IsEmail, IsOptional, IsString, IsBoolean, IsPhoneNumber } from 'class-validator';


export class CreateUserDto {
    @IsOptional() @IsEmail() email?: string;
    @IsString() phone: string;
    @IsString() passwordHash: string;
    @IsString() firstName: string;
    @IsString() lastName: string;
    @IsOptional() @IsString() avatarUrl?: string;
}


export class UpdateUserDto {
    @IsOptional() @IsEmail() email?: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsString() firstName?: string;
    @IsOptional() @IsString() lastName?: string;
    @IsOptional() @IsString() avatarUrl?: string;
    @IsOptional() @IsBoolean() isActive?: boolean;
    @IsOptional() @IsBoolean() isPhoneVerified?: boolean;
}
