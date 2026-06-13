// dto/login.dto.ts
import { IsNotEmpty, IsNumberString } from 'class-validator';


export class LoginDto {
    @IsNotEmpty()
    @IsNumberString()
    phone: string;

    @IsNotEmpty()
    password: string;
}
