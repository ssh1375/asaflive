import { ConflictException, Injectable, Logger, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, WebhookReceiver, RoomServiceClient } from 'livekit-server-sdk';
import { NewSessionDto } from 'src/session-manager/dto/new-session.dto';
import { EgressClient, EgressStatus, EncodedFileOutput, EncodedFileType } from 'livekit-server-sdk';
import * as path from 'path';




@Injectable()
export class LivekitService {
    private readonly logger = new Logger(LivekitService.name);
    private readonly webhookReceiver: WebhookReceiver;
    private readonly egressClient: EgressClient; // <-- Add EgressClient

    // Ideally, inject these via NestJS ConfigService instead of direct process.env

    private readonly roomService: RoomServiceClient; // <-- Add this


    constructor(private readonly configService: ConfigService) {

        const apiKey = this.configService.getOrThrow<string>('LIVEKIT_API_KEY');
        const apiSecret = this.configService.getOrThrow<string>('LIVEKIT_API_SECRET');
        const livekitUrl = this.configService.getOrThrow<string>('LIVEKIT_URL');

        this.webhookReceiver = new WebhookReceiver(apiKey, apiSecret);

        // Initialize RoomService once here
        this.roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
        this.egressClient = new EgressClient(livekitUrl, apiKey, apiSecret);
    }

    /**
     * Generates a token for a user to join a specific room
     */

    async createRoom(session: NewSessionDto) {

        // where is the server how to connect to server
        const roomService = new RoomServiceClient(
            process.env.LIVEKIT_URL || '',
            this.configService.getOrThrow<string>('LIVEKIT_API_KEY'),
            this.configService.getOrThrow<string>('LIVEKIT_API_SECRET')
        );


        const rooms = await this.roomService.listRooms();

        if (rooms.length > 1) {
            console.log('other room exists: ', rooms);
            throw new ConflictException(rooms);
        }



        console.log(session);
        // create custom room in server
        const room = await roomService.createRoom({
            ...session,
            metadata: JSON.stringify(session.metadata)
        });
        console.log('room created: ', room);

        const fileName = path.join(this.configService.getOrThrow<string>('LIVEKIT_RECORDING_BASE_URL'), `${room.name}.mp4`);

        console.log('Room created successfully:', fileName);

        const fileOutput = new EncodedFileOutput({
            fileType: EncodedFileType.MP4,
            filepath: fileName,
        });

        const egress = await this.egressClient.startRoomCompositeEgress(
            room.name,
            { file: fileOutput },
            { layout: 'grid' });

        console.log(`Started recording for room ${room.name}. Egress ID: ${egress.egressId}`);

        return { room, egress };
    }


    async checkRecordingStatus(egressId: string) {
        // Fetch all egresses for the specific room
        const egresses = await this.egressClient.listEgress({ egressId });

        // Check if any egress is currently active or starting
        const isRecording = egresses.some((egress) =>
            egress.status === EgressStatus.EGRESS_ACTIVE ||
            egress.status === EgressStatus.EGRESS_STARTING
        );

        if (isRecording) {
            console.log(`Recording is currently in progress for room: ${egressId}`);
        } else {
            console.log(`No active recordings for room: ${egressId}`);
        }

        return isRecording;
    }



    async deleteRooms() {
        const rooms = await this.roomService.listRooms();
        // 2. Loop through and delete each room
        for (const room of rooms) {
            await this.roomService.deleteRoom(room.name);
            console.log(`Deleted room: ${room.name}`);
        }

        return { message: `Successfully closed ${rooms.length} rooms.` };
    }


    async startSessionRecording(roomName: string) {

    }


    async generateParticipantToken(
        room: string,
        permissions: { roomJoin: boolean, canPublish: boolean, canSubscribe: boolean },
        participantIdentity: string, name: string): Promise<string> {

        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET, {
            identity: participantIdentity,
            name
        });

        // Grant permissions to join and publish/subscribe to the room
        at.addGrant({
            ...permissions,
            room,
        });

        return await at.toJwt();
    }

    /**
     * Validates and parses incoming webhooks from LiveKit server
    */

    processWebhook(body: string, authHeader: string) {
        try {
            const event = this.webhookReceiver.receive(body, authHeader);
            // this.logger.log(`Received LiveKit webhook event: ${event.event} for room: ${event.room?.name}`);
            return event;
        } catch (error) {
            this.logger.error('Failed to validate LiveKit webhook signature', error);
            throw error;
        }
    }

    async kickParticipant(meetingId, participantIdentity) {
        try {
            await this.roomService.removeParticipant(meetingId, participantIdentity);
            return { success: true };
        } catch (error) {
            this.logger.error(`Error:`, error);
            throw error;
        }
    }


}
