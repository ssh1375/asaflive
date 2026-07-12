import { Module } from '@nestjs/common';
import { SessionManagerController } from './session-manager.controller';
import { SessionManagerService } from './session-manager.service';
import { LivekitService } from 'src/livekit/livekit.service';

@Module({
  controllers: [SessionManagerController],
  providers: [SessionManagerService, LivekitService]
})
export class SessionManagerModule {}
