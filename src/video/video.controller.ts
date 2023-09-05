import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';

import { AudioRequest } from 'src/events/types/events.types';
import { EventService } from '../events/event.service';
import { EventBus } from '../events/eventbus.service';
import { VideoRequest } from '../events/types/common-types';
import * as Store from '../schemas/event.schema';
import { VideoDocument } from '../schemas/video.schema';
import { VideoService } from './video.service';

interface VideoResponse {
  id: string;
}

export class InternalServerError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class NotFound extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * This controller is responsible for handling requests to download videos.
 */
@Controller('v1')
export class VideoController {
  constructor(
    private videoJobHandler: EventBus,
    private eventService: EventService,
    private videoService: VideoService,
  ) {}

  private logger = new Logger(VideoController.name);

  @Get('/events')
  async getAll(): Promise<Store.EventDocument[]> {
    return this.eventService.findAll();
  }

  @Get('/videos/:id')
  async getVideo(@Param('id') id: string): Promise<VideoDocument> {
    const video = await this.videoService.findOne(id);
    this.logger.log(`[getVideo] Video ${JSON.stringify(video)}`);
    if (!video) {
      throw new NotFound(`Video ${id} not found`);
    }
    return video;
  }

  @Post('/videos')
  async generateAudios(
    @Body() jobRequest: VideoRequest,
  ): Promise<VideoResponse> {
    try {
      this.logger.log(
        `[generateAudios] Download request receieved ${JSON.stringify(
          jobRequest,
        )}`,
      );
      const id = this.generateUniqueId();
      const audioRequestEvent: AudioRequest = new AudioRequest({
        url: jobRequest.url,
        user: jobRequest.user,
        jobId: id,
      });
      this.videoService.apply(audioRequestEvent);
      await this.videoJobHandler.submit(audioRequestEvent);
      const jobResponse = { id: id };
      return jobResponse;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerError(
        `Error handling the request, please try again. ${e.message}`,
      );
    }
  }

  private generateUniqueId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
