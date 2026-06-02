import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
