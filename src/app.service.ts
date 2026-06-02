import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

import { User } from 'generated/prisma/client'

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService){}
  async getHello(): Promise<User> {
   
    const user = await this.prisma.user.create({
      data: {
        phone: 'hendeseh20@gmail.com',
        firstName: "sajad",
        lastName: "sajad",
        passwordHash: ""
      }
    });
    return user;
    
  }
}
