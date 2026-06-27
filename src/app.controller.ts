import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';


@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) { }



  @Get()
  async api() {
    return {
      message: 'success'
    }
  }



  @Get('redis')
  async pingRedis() {
    return {
      redis: await this.appService.pingRedis()
    }
  }
}
