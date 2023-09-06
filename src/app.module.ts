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
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT as unknown as number,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        tls: {
          rejectUnauthorized: false,
          requestCert: true,
        },
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
