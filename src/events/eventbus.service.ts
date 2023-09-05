import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { BaseEvent } from 'src/events/types/events.types';
import { EventEntityDto } from './dto/event-entity.dto';
import { EventService } from './event.service';

/**
 * Stores the request in the database and adds the job to the queue.
 */
@Injectable()
export class EventBus {
  constructor(
    @InjectQueue('video') private videoQueue: Queue,
    private eventService: EventService,
  ) {}

  private logger = new Logger(EventBus.name);

  async submit(request: BaseEvent): Promise<string> {
    try {
      this.logger.log(
        `<============== Incoming Event (${request.type}) =======================> `,
      );
      const event: EventEntityDto = {
        type: request.type,
        version: request.version,
        timestamp: request.timestamp,
        data: request.data,
      };
      await this.eventService.create(event);
      await this.videoQueue.add(request);
    } catch (e) {
      return 'error';
    }
  }
}
