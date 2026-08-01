import { IsNotEmpty, IsNumberString, IsString } from "class-validator";


export class SendMessageDto {

    @IsNumberString()
    phone: string;

    @IsString()
    @IsNotEmpty()
    link: string;

}