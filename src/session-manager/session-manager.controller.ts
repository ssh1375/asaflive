import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { NewSessionDto } from './dto/new-session.dto';
import { SessionManagerService } from './session-manager.service';
import { InviteMeetingDto } from './dto/invite.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
@Controller('session-manager')
export class SessionManagerController {
    // create new video session
    constructor(private sessionManagerService: SessionManagerService) { }
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

    // create invite link for new user
    @Post('invite/:meeting_id')
    async invite(@Body() inviteDto: InviteMeetingDto, @Param('meeting_id') meeting_id: string) {
        //  if session exist then generate jwt token for him
        return await this.sessionManagerService.inviteParticipant(inviteDto, meeting_id);
    }


    @Post(invite /: meeting_id)

    @Delete('meetings/:meeting_id/participants/:participant_identity')
    async kickFromMeeting(@Param('meeting_id') meetingId: string, @Param('participant_identity') participantIdentity: string,
    ) {
        return await this.sessionManagerService.kickParticipant(meetingId, participantIdentity);
    }

    // get user invite link again
}
