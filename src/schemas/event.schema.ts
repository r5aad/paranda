import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EventDocument = HydratedDocument<EventEntity>;

@Schema()
export class EventEntity {
  @Prop({ required: true })
  type: string;
  @Prop({ required: true })
  version: string;
  @Prop({ required: true })
  timestamp: string;
  @Prop({ type: Object, required: true })
  data: Record<string, any>;
}

export const EventEntitySchema = SchemaFactory.createForClass(EventEntity);
