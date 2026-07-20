import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { LivekitService } from 'src/livekit/livekit.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewSessionDto } from './dto/new-session.dto';
import { InviteMeetingDto } from './dto/invite.dto';
import { PaginationDto } from 'src/users/dto/paginate.dto';
import * as crypto from 'crypto';
import { createReadStream, statSync, existsSync } from 'fs';

import * as path from 'path';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class SessionManagerService {

    constructor(private prismaService: PrismaService,
        private livekitService: LivekitService,
        private readonly configService: ConfigService
    ) {

    }

    async getAll(paginate: PaginationDto) {
        const whereCondition = {};

        const [data, count] = await this.prismaService.$transaction([
            this.prismaService.meeting.findMany({
                where: whereCondition,
                ...paginate.paginate,
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    name: true,
                    metadata: true,
                    createdAt: true
                }
            }),
            this.prismaService.meeting.count({
                where: whereCondition,
            })
        ])
        return { count, data }
    }

    async createNewSession(session: NewSessionDto) {

        // first create it into db and use id as name of session to distinc all session
        // if two session has one name new new override the property into last one

        // name in livekit should be unique you cannot create two room same time
        // use id as name to two room mistake name could be avoided
        // the name that user input save as name in meeting model
        const livekitRoomName = crypto.randomUUID();
        const { name, ...rest } = session;

        // adding some unique udentifier to room name
        const { room, egress } = await this.livekitService.createRoom({
            name: livekitRoomName,
            ...rest
        });

        // adding unqiue room name to meta data of meeting
        session.metadata = { livekitRoomName, ...session.metadata };
        // // create meeting with unique name
        const meeting = await this.prismaService.meeting.create({
            data: {
                ...session,
                id: room.sid,
                egressdata: JSON.stringify(egress)
            }
        });

        return {
            meetingId: meeting.id,
            egress: {
                id: egress?.egressId,
                status: egress?.status
            }
        };

    }

    async roomRecordingStatus(egressId: string) {
        return await this.livekitService.checkRecordingStatus(egressId);
    }


    async inviteParticipant(inviteDto: InviteMeetingDto, meeting_id: string) {

        // meeting should be exist and not deleted
        const meeting = await this.prismaService.meeting.findFirstOrThrow({
            where: { id: meeting_id }
        });

        const sessionFinishedTime = meeting.createdAt.getTime() + (meeting.sessionExpiry * 1000);

        const timeLeftMs = sessionFinishedTime - (new Date().getTime());

        const FIVE_MINUTES_IN_MS = 5 * 60 * 1000; // 300,000 ms


        if (timeLeftMs < 0) {
            throw new ForbiddenException('The meeting has already expired.');
        }

        if (timeLeftMs < FIVE_MINUTES_IN_MS) {
            throw new ForbiddenException('You cannot join. Less than 5 minutes remaining in this session.');
        }


        const { permissions, ...rest } = inviteDto;
        // create this participant for meeting
        const meetingParticipant = await this.prismaService.meetingParticipant.create({
            data: {
                ...rest,
                meetingId: meeting.id
            }
        });
        try {
            // 4. SECOND: Generate Token using the generated DB ID
            // فرض می‌کنیم شناسه جلسه همان نام روم در لایوکیت است
            console.log(meeting?.metadata)
            const token = await this.livekitService.generateParticipantToken(
                // room
                meeting?.metadata?.['livekitRoomName'],
                inviteDto.permissions,
                meetingParticipant.id, // identity (گرفته شده از دیتابیس)
                inviteDto.displayName
            );


            await this.prismaService.meetingParticipant.update({
                where: {
                    id: meetingParticipant.id
                },
                data: {
                    inviteToken: token
                }
            })


            // 5. Return both DB record and the generated token
            return {
                participant: meetingParticipant,
                accessToken: token
            };

        } catch (error) {
            // اختیاری: اگر تولید توکن به هر دلیلی خطا خورد، می‌توانید کاربری که در دیتابیس ساخته‌اید را حذف کنید
            throw new InternalServerErrorException('Participant saved, but failed to generate LiveKit token.');
        }
    }


    async kickParticipant(meetingId: string, participantIdentity: string) {
        return await this.livekitService.kickParticipant(meetingId, participantIdentity);
    }


    async getLivekitRoomFile(livekitRoomname: string) {
        const filename = path.join(this.configService.getOrThrow('LIVEKIT_DOWNLOAD_PATH'), livekitRoomname + ".mp4");
        if (!existsSync(filename)) {
            throw new NotFoundException(`Video with id ${livekitRoomname} not found.`);
        }

        return createReadStream(filename);
    }

}
