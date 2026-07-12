import { Injectable, Logger, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, WebhookReceiver, RoomServiceClient } from 'livekit-server-sdk';
import { NewSessionDto } from 'src/session-manager/dto/new-session.dto';
import { EgressClient, EncodedFileOutput, EncodedFileType } from 'livekit-server-sdk';
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

        let room;
        // where is the server how to connect to server
        const roomService = new RoomServiceClient(
            process.env.LIVEKIT_URL || '',
            this.configService.getOrThrow<string>('LIVEKIT_API_KEY'),
            this.configService.getOrThrow<string>('LIVEKIT_API_SECRET')
        );

        // create custom room in server
        room = await roomService.createRoom({
            ...session,
            metadata: JSON.stringify(session.metadata)
        });

        console.log('Room created successfully:', room.name, ' ', this.configService.getOrThrow<string>('LIVEKIT_RECORDING_BASE_URL'), `${room.name} - ${Date.now()}.mp4`);

        const fileOutput = new EncodedFileOutput({
            fileType: EncodedFileType.MP4,
            filepath: path.join(this.configService.getOrThrow<string>('LIVEKIT_RECORDING_BASE_URL'), `${room.name} - ${Date.now()}.mp4`),
        });

        const egressInfo = await this.egressClient.startRoomCompositeEgress(
            room.name,
            { file: fileOutput },
            { layout: 'grid' }
        );

        console.log(`Started recording for room ${room.name}. Egress ID: ${egressInfo.egressId}`, ' ', egressInfo);
        return { room, egress: egressInfo };
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
