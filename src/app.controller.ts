import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from 'generated/prisma/client';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<User> {
    return await this.appService.getHello();
  }
}
