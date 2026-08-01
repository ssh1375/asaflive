import { Body, Controller, Delete, Get, Header, HttpStatus, Param, ParseUUIDPipe, Post, Query, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { NewSessionDto } from './dto/new-session.dto';
import { SessionManagerService } from './session-manager.service';
import { InviteMeetingDto } from './dto/invite.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
import { LivekitService } from 'src/livekit/livekit.service';
import { Response } from 'express';
import { SendMessageDto } from './dto/send-sms.dto';
import { RequirePermissions } from 'src/auth/permission-decorator';
import { SessionAuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/auth/permission.guard';
@Controller('session-manager')
export class SessionManagerController {
    // create new video session
    constructor(
        private sessionManagerService: SessionManagerService,
        private livekitService: LivekitService) { }

    @Get()
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:showAll')
    async getAll(@Query() paginateDto: PaginationDto) {
        // get all meeting
        return await this.sessionManagerService.getAll(paginateDto);
    }


    @Post('new-session')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:create')
    async newSession(@Body() session: NewSessionDto) {
        // create the session
        return await this.sessionManagerService.createNewSession(session);
    }

    @Delete('room')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:delete')
    async deleteAllRooms() {
        return await this.livekitService.deleteRooms();
    }

    // create invite link for new user
    @Post('invite/:meeting_id')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:invite')
    async invite(@Body() inviteDto: InviteMeetingDto, @Param('meeting_id') meeting_id: string) {
        //  if session exist then generate jwt token for him
        return await this.sessionManagerService.inviteParticipant(inviteDto, meeting_id);
    }

    @Post('send-sms')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:invite')
    async sendSms(@Body() sendMessage: SendMessageDto) {
        const { phone, link } = sendMessage;
        return await this.sessionManagerService.sendMessage(phone, link);
    }

    // create invite link for new user
    @Get('download/:livekitRoomName')
    @Header('Content-Type', 'video/mp4')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:download')
    async downloadMeetingVideoFile(@Param('livekitRoomName', new ParseUUIDPipe) livekitRoomName: string, @Res({ passthrough: true }) res: Response) {

        // download meeting file
        const { stream, content_length } = await this.sessionManagerService.getLivekitRoomFile(livekitRoomName);

        res.setTimeout(0);

        res.set({
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="video.mp4" `,
            'Content-Length': content_length,
        });

        return new StreamableFile(stream);
    }



    @Get('meeting/:egressId')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:create')
    async checkRecordingStatus(@Param('egressId') egressId: string) {
        return await this.livekitService.checkRecordingStatus(egressId);
    }



    @Delete('meetings/:meeting_id/participants/:participant_identity')
    @UseGuards(SessionAuthGuard, PermissionsGuard)
    @RequirePermissions('session:delete_participant')
    async kickFromMeeting(@Param('meeting_id') meetingId: string, @Param('participant_identity') participantIdentity: string,
    ) {
        return await this.sessionManagerService.kickParticipant(meetingId, participantIdentity);
    }
}
