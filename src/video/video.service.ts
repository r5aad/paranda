import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  AudioCompleted,
  AudioFailure,
  AudioRequest,
  BaseEvent,
  EventTypes,
} from 'src/events/types/events.types';
import { VideoDocument, VideoEntity } from 'src/schemas/video.schema';
import { VideoEntityDto } from './dto/video-entity.dto';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(VideoEntity.name) private videoModel: Model<VideoEntity>,
  ) {}

  private logger = new Logger(VideoService.name);

  async create(jobDto: VideoEntityDto): Promise<VideoDocument> {
    this.logger.log(`Creating an event ${JSON.stringify(jobDto)}`);
    const createdJob = new this.videoModel(jobDto);
    return createdJob.save();
  }

  async findAll(): Promise<VideoDocument[]> {
    this.logger.log(`find all events`);
    return this.videoModel.find().sort({ timestamp: -1 }).exec();
  }

  async findOne(id: string): Promise<VideoDocument | null> {
    this.logger.log(`find event ${id}`);
    return this.videoModel.findOne({ jobId: id }).exec();
  }

  async applyAudioRequest(event: AudioRequest): Promise<void> {
    await this.create({
      jobId: event.data.jobId,
      status: 'REQUESTED',
      url: event.data.url,
      path: null,
    });
  }

  async applyAudioFailure(event: AudioFailure): Promise<void> {
    await this.create({
      jobId: event.data.jobId,
      status: 'FAILURE',
      url: event.data.url,
      path: null,
    });
  }

  async applyAudioComplete(event: AudioCompleted): Promise<void> {
    await this.create({
      jobId: event.data.jobId,
      status: 'COMPLETE',
      url: event.data.url,
      path: event.data.path,
    });
  }

  async apply(baseEvent: BaseEvent): Promise<void> {
    this.logger.log(`[apply] Applying event ${JSON.stringify(baseEvent)}`);
    if (baseEvent.type === EventTypes.AUDIO_REQUESTED) {
      await this.applyAudioRequest(baseEvent as AudioRequest);
    } else if (baseEvent.type === EventTypes.AUDIO_COMPLETED) {
      await this.applyAudioComplete(baseEvent as AudioRequest);
    } else if (baseEvent.type === EventTypes.AUDIO_FAILED) {
      await this.applyAudioFailure(baseEvent as AudioRequest);
    } else {
      this.logger.error(`[apply] Unknown event type ${baseEvent.type}`);
      throw new Error(`Unknown event type ${baseEvent.type}`);
    }
  }
}
