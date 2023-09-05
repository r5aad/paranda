import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { EventService } from './events/event.service';
import { EventBus } from './events/eventbus.service';
import { EventEntity, EventEntitySchema } from './schemas/event.schema';
import { VideoEntity, VideoEntitySchema } from './schemas/video.schema';
import { EventRouter } from './video/event-router.service';
import { Downloader } from './video/processors/downloader.service';
import { Notifier } from './video/processors/notifier.service';
import { VideoController } from './video/video.controller';
import { VideoService } from './video/video.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
      { name: VideoEntity.name, schema: VideoEntitySchema },
    ]),
    MongooseModule.forRoot('mongodb://user:password@localhost:27017'),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'video',
    }),
  ],
  controllers: [AppController, VideoController],
  providers: [
    AppService,
    EventRouter,
    EventBus,
    EventService,
    Downloader,
    Notifier,
    VideoService,
  ],
})
export class AppModule {}
