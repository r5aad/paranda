import { Logger } from '@nestjs/common';
import { AudioCompleted, AudioFailure } from 'src/events/types/events.types';
import { EventProcessor } from './eventprocessor.service';

export class Notifier implements EventProcessor {
  constructor() {}

  logger = new Logger(Notifier.name);

  process(event: AudioCompleted | AudioFailure): void {
    this.logger.log(
      `[process] Notifying user ${event.data.user} about ${event.type}`,
    );
  }
}
