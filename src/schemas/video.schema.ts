import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type VideoDocument = HydratedDocument<VideoEntity>;

@Schema()
export class VideoEntity {
  @Prop({ required: true })
  jobId: string;
  @Prop({ required: true })
  url: string;
  @Prop({ required: true })
  status: string;
  @Prop()
  path: string;
}

export const VideoEntitySchema = SchemaFactory.createForClass(VideoEntity);
