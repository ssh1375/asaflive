import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { RedisService } from './common/redis/redis.service';
import { RedisStore } from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.set('trust proxy', 1);

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  app.use(
    session({
      genid: () => randomBytes(128).toString('hex'),
      store: new RedisStore({ client: app.get(RedisService).getClient(), prefix: "asaflive:session:" }),
      secret: configService.get<string>('SESSION_SECRET') || 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        // for js could not access the cookie and session ID
        httpOnly: true,
        // if cros want to be work secure must be true
        secure: true,
        // for cros to be work sameSite: none
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        // the max age of cookie
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({
    // Strip properties that have no validation decorators
    whitelist: true,
    // no sound for extra information is sent just become silence
    forbidNonWhitelisted: false,
    // Auto-transform plain objects to DTO class instances
    transform: true,
    transformOptions: {
      // Convert primitive types automatically without needing @Type() decorator
      enableImplicitConversion: true,
    },
    // Hide validation error details in production for security
    disableErrorMessages: process.env.NODE_ENV === 'production',
    // Return all validation errors at once (false) vs only the first one (true)
    stopAtFirstError: false,
    // Customize the shape of validation error responses
    exceptionFactory: (errors) => new BadRequestException(errors),
  }));

  app.useGlobalFilters(new PrismaExceptionFilter);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
