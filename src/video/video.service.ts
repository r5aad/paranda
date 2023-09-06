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
import { AudioRequestStatus, VideoEntityDto } from './dto/video-entity.dto';

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
      status: AudioRequestStatus.REQUESTED,
      url: event.data.url,
    });
  }

  async applyAudioFailure(event: AudioFailure): Promise<void> {
    const update: VideoEntityDto = {
      jobId: event.data.jobId,
      status: AudioRequestStatus.FAILED,
      path: event.data.path,
    };
    await this.update(update);
  }

  async update(update: VideoEntityDto) {
    if (!update.jobId) {
      throw new Error('Missing jobId');
    }
    const filter = { jobId: update.jobId };
    await this.videoModel.findOneAndUpdate(filter, update);
  }

  /**
   * Get existing audio, and then change the status
   */
  async applyAudioComplete(event: AudioCompleted): Promise<void> {
    const update: VideoEntityDto = {
      jobId: event.data.jobId,
      status: AudioRequestStatus.COMPLETED,
    };
    await this.update(update);
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
