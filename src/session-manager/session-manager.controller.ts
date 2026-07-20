import { Body, Controller, Delete, Get, Header, Param, ParseUUIDPipe, Post, Query, Res, StreamableFile } from '@nestjs/common';
import { NewSessionDto } from './dto/new-session.dto';
import { SessionManagerService } from './session-manager.service';
import { InviteMeetingDto } from './dto/invite.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
import { LivekitService } from 'src/livekit/livekit.service';
import { Response } from 'express';
@Controller('session-manager')
export class SessionManagerController {
    // create new video session
    constructor(
        private sessionManagerService: SessionManagerService,
        private livekitService: LivekitService) { }
    @Get()
    async getAll(@Query() paginateDto: PaginationDto) {
        // get all meeting
        return await this.sessionManagerService.getAll(paginateDto);
    }

    @Post('new-session')
    async newSession(@Body() session: NewSessionDto) {
        // create the session
        return await this.sessionManagerService.createNewSession(session);
    }

    @Delete('room')
    async deleteAllRooms() {
        return await this.livekitService.deleteRooms();
    }

    // create invite link for new user
    @Post('invite/:meeting_id')
    async invite(@Body() inviteDto: InviteMeetingDto, @Param('meeting_id') meeting_id: string) {
        //  if session exist then generate jwt token for him
        return await this.sessionManagerService.inviteParticipant(inviteDto, meeting_id);
    }


    // create invite link for new user
    @Get('download/:livekitRoomName')
    @Header('Content-Type', 'video/mp4')

    async downloadMeetingVideoFile(@Param('livekitRoomName', new ParseUUIDPipe) livekitRoomName: string, @Res({ passthrough: true }) res: Response) {
        // download meeting file
        const fileReadStream = await this.sessionManagerService.getLivekitRoomFile(livekitRoomName);
        return new StreamableFile(fileReadStream);
    }

    @Get('meeting/:egressId')
    async checkRecordingStatus(@Param('egressId') egressId: string) {
        return await this.livekitService.checkRecordingStatus(egressId);
    }

    @Delete('meetings/:meeting_id/participants/:participant_identity')
    async kickFromMeeting(@Param('meeting_id') meetingId: string, @Param('participant_identity') participantIdentity: string,
    ) {
        return await this.sessionManagerService.kickParticipant(meetingId, participantIdentity);
    }


}
