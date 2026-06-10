import { IsString, IsNotEmpty, IsFQDN } from 'class-validator';
import { Prisma } from 'generated/prisma/client';

export class CreateDomainDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}


export const DomainSelect = {
    id: true,
    name: true
} satisfies Prisma.DomainSelect;