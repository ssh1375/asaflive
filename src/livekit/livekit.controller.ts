import { Controller, Post, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { Request, Response } from 'express';

@Controller('livekit')
export class LivekitController {
    private readonly logger = new Logger(LivekitController.name);

    constructor(private readonly livekitService: LivekitService) { }

    @Post('webhooks')
    async handleWebhooks(@Req() req: Request, @Res() res: Response) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(HttpStatus.UNAUTHORIZED).send('Missing Authorization header');
        }

        // Attempt to get the body as a string for webhook validation
        const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        try {
            const event = this.livekitService.processWebhook(bodyString, authHeader);

            // Handle different LiveKit events to sync with your database
            // switch (event.event) {
            //     case 'participant_joined':
            //         this.logger.log(`Participant ${event.participant?.identity} joined room ${event.room?.name}`);
            //         break;
            //     case 'participant_left':
            //         this.logger.log(`Participant ${event.participant?.identity} left room ${event.room?.name}`);
            //         break;
            //     case 'room_finished':
            //         this.logger.log(`Room ${event.room?.name} has ended.`);
            //         // e.g., Update your database session status to 'ended'
            //         break;
            // }

            return res.status(HttpStatus.OK).send();
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).send('Invalid webhook signature');
        }
    }
}
