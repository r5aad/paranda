export class BaseEvent {
  type: EventTypes;
  version: string;
  timestamp: Date = new Date();
  data: any;

  constructor(type: EventTypes, version: string, data: any) {
    this.type = type;
    this.version = version;
    this.data = data;
  }
}

export class AudioRequest extends BaseEvent {
  constructor(data: AudioRequestData) {
    super(EventTypes.AUDIO_REQUESTED, '1.0', data);
  }
}

export class AudioCompleted extends BaseEvent {
  constructor(data: AudioCompleteData) {
    super(EventTypes.AUDIO_COMPLETED, '1.0', data);
  }
}

export class AudioFailure extends BaseEvent {
  constructor(data: AudioFailureData) {
    super(EventTypes.AUDIO_FAILED, '1.0', data);
  }
}

export enum EventTypes {
  AUDIO_REQUESTED = 'AUDIO_REQUESTED',
  AUDIO_COMPLETED = 'AUDIO_COMPLETED',
  AUDIO_FAILED = 'AUDIO_FAILED',
}

export interface AudioRequestData {
  jobId: string;
  user: string;
  url: string;
}

export interface AudioCompleteData {
  jobId: string;
  user: string;
  url: string;
  audioFile: string;
}

export interface AudioFailureData {
  jobId: string;
  user: string;
  url: string;
  error: string;
}
