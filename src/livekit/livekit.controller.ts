import { Controller, Post, Req, Res, HttpStatus, Logger, RawBodyRequest, Headers, BadRequestException } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { Request, Response } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';


@Controller('webhooks/livekit')
export class LivekitController {

    private webhookReceiver: WebhookReceiver;

    constructor(private readonly livekitService: LivekitService,
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService) {
        this.webhookReceiver = new WebhookReceiver(
            this.configService.getOrThrow<string>('LIVEKIT_API_KEY'),
            this.configService.getOrThrow<string>('LIVEKIT_API_SECRET')
        );
    }

    @Post()
    async handleWebhooks(@Req() req: RawBodyRequest<Request>, // <-- 1. Wrap Request with RawBodyRequest
        @Headers('Authorization') authHeader: string) {

        const rawBody = req.rawBody;
        console.log(req.body);

        console.log(rawBody);

        if (!rawBody) {
            throw new BadRequestException('Raw body is required for webhook verification');
        }

        try {
            // 3. Pass the RAW string (not req.body) to the receiver
            const event = await this.webhookReceiver.receive(rawBody?.toString('utf8'), authHeader);

            console.log(`Received LiveKit event: ${event} for room ${event.room?.name}`);
            if (event.event.startsWith('egress_')) {
                await this.prismaService.meeting.update({
                    where: {
                        id: event.egressInfo?.roomId
                    },
                    data: {
                        egressdata: JSON.stringify(event.egressInfo)
                    }
                })
            }

            return { status: 'success' };
        } catch (error) {
            console.error('Webhook verification failed:', error);
            throw new BadRequestException('Invalid webhook signature');
        }
    }
}
