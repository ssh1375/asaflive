import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Prisma } from 'generated/prisma/browser';
import { User } from 'generated/prisma/client'

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService){}
  async getHello(): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: 'hendeseh20@gmail.com',
        name: "sajad"
      }
    });
    return user;
  }
}
