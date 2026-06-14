import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from 'generated/prisma/client';


@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('redis')
  async pingRedis() {
    return {
      redis: await this.appService.pingRedis()
    }
  }
}
