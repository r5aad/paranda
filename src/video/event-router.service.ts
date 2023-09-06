import { Job } from 'bull';

import { OnQueueEvent, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventService } from 'src/events/event.service';
import {
  AudioRequest,
  BaseEvent,
  EventTypes,
} from '../events/types/events.types';
import { Downloader } from './processors/downloader.service';
import { Notifier } from './processors/notifier.service';

@Processor('video')
export class EventRouter {
  constructor(
    private downloader: Downloader,
    private notifier: Notifier,
    private eventService: EventService,
  ) {}

  private logger = new Logger(EventRouter.name);

  @OnQueueEvent('failed')
  onFailedJob(job: Job, error: Error) {
    this.logger.log(`Job ${job.id} failed with error: ${error.message}`);
  }

  @Process()
  async process(job: Job<BaseEvent>): Promise<string> {
    this.logger.log(
      `[process] Found a new job ${
        job.id
      } from the queue with data ${JSON.stringify(job.data)}`,
    );

    try {
      const videoEvent: BaseEvent = job.data;
      await this.eventService.create(videoEvent);
      if (videoEvent.type === EventTypes.AUDIO_REQUESTED) {
        const audioRequest: AudioRequest = videoEvent as AudioRequest;
        this.downloader.process(audioRequest).catch((e) => {
          this.logger.error(e);
        });
      } else if (videoEvent.type === EventTypes.AUDIO_COMPLETED) {
        this.logger.log(`[process] Audio completed ${videoEvent.data}`);
        this.notifier.process(videoEvent);
      } else if (videoEvent.type === EventTypes.AUDIO_FAILED) {
        this.notifier.process(videoEvent);
      }
      return;
    } catch (e) {
      this.logger.error(e);
      return;
    }
  }
}
