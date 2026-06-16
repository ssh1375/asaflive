import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { DiscoveryModule, MetadataScanner, Reflector } from '@nestjs/core';


@Module({
  imports: [
    DiscoveryModule, MetadataScanner, Reflector,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        privateKey: process.env.JWT_PRIVATE?.replaceAll('\\n', '\n'),
        publicKey: process.env.JWT_PUBLIC?.replaceAll('\\n', '\n'),
        signOptions: {
          expiresIn: '15m',
          algorithm: 'RS256',
        },
      }),
    })
  ],
  providers: [
    AuthService,
    UserService,
  ],
  controllers: [AuthController]
})
export class AuthModule { }
