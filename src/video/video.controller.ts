import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
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
  async getAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ): Promise<Store.EventDocument[]> {
    return this.eventService.findAll(limit, offset);
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

  @Get('/videos')
  async getVideos(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ): Promise<VideoDocument[]> {
    return await this.videoService.findAll(limit, offset);
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
      const result = await this.videoJobHandler.submit(audioRequestEvent);
      const jobResponse = { id: id, message: result };
      this.videoService.apply(audioRequestEvent);
      return jobResponse;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerError(
        `Unable to accept request at this time. ${e.message}`,
      );
    }
  }

  private generateUniqueId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
