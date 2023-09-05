import { BaseEvent } from 'src/events/types/events.types';

/**
 * Interface for all event processors.
 */
export interface EventProcessor {
  process(event: BaseEvent): void;
}
