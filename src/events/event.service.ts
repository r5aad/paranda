import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { EventDocument, EventEntity } from '../schemas/event.schema';
import { EventEntityDto } from './dto/event-entity.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(EventEntity.name) private eventModel: Model<EventEntity>,
  ) {}

  private logger = new Logger(EventService.name);

  async create(jobDto: EventEntityDto): Promise<EventDocument> {
    this.logger.log(`Creating an event ${JSON.stringify(jobDto)}`);
    const createdJob = new this.eventModel(jobDto);
    return createdJob.save();
  }

  async findAll(limit: number, offset: number): Promise<EventDocument[]> {
    this.logger.log(`find all events`);
    return this.eventModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ timestamp: -1 })
      .exec();
  }

  async findOne(id: string): Promise<EventDocument | null> {
    this.logger.log(`find event ${id}`);
    return this.eventModel.findOne({ jobId: id }).exec();
  }
}
