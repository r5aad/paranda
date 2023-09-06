import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { BaseEvent } from 'src/events/types/events.types';

/**
 * Stores the request in the database and adds the job to the queue.
 */
@Injectable()
export class EventBus {
  constructor(@InjectQueue('video') private videoQueue: Queue) {}

  private logger = new Logger(EventBus.name);
  private timeout = 500;

  async submit(request: BaseEvent): Promise<string> {
    this.logger.log(
      `|============== Incoming Event (${request.type}) =======================|`,
    );

    this.logger.log(`Queue status ${this.videoQueue.client.status}`);
    const videoQueuePromise = this.videoQueue.add(request, {
      removeOnComplete: 1,
      removeOnFail: 5,
    });
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out'));
      }, this.timeout);
    });
    this.logger.log(`Now racing`);
    const result = await Promise.race([videoQueuePromise, timeoutPromise]);
    this.logger.log(`Error adding to the queue ${result}`);
    if (result instanceof Error) {
      throw new Error(`Couldn't accept request  ${result.message}`);
    }
    return 'success';
  }
}
