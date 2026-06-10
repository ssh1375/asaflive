// create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsPhoneNumber, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from 'generated/prisma/client';


/**
 * Data Transfer Object for creating a new User.
 * Validates the incoming payload before it reaches the service layer.
 */
export class CreateUserDto {

    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty({ message: 'Phone number is required' })
    // @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
    phone: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsNotEmpty({ message: 'First name is required' })
    @IsString()
    firstName: string;

    @IsNotEmpty({ message: 'Last name is required' })
    @IsString()
    lastName: string;
}



export const UserSelect = {
    id: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true
} satisfies Prisma.UserSelect;

/**
 * Data Transfer Object for updating an existing User.
 * Inherits from CreateUserDto but makes all properties optional.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) { }
