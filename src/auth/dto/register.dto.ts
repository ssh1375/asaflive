// dto/register.dto.ts
import { IsNotEmpty, IsNumberString, IsPhoneNumber, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @Matches(/^09[0-9]{9}$/, { message: 'Invalid Iranian mobile number' })
  phone: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}