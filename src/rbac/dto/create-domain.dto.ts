import { IsString, IsNotEmpty, IsFQDN } from 'class-validator';

export class CreateDomainDto {
    @IsString()
    @IsNotEmpty()
    @IsFQDN()
    name: string;
}