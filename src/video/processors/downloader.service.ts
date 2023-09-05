import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from 'src/events/eventbus.service';
import {
  AudioCompleted,
  AudioFailure,
  AudioRequest,
  AudioRequestData,
} from 'src/events/types/events.types';
import { VideoService } from '../video.service';
import { EventProcessor } from './eventprocessor.service';
import ytdl = require('ytdl-core');
import fs = require('fs');

@Injectable()
export class Downloader implements EventProcessor {
  constructor(
    private eventBus: EventBus,
    private videoService: VideoService,
  ) {}

  private logger = new Logger(Downloader.name);

  async process(audioRequest: AudioRequest): Promise<string> {
    try {
      const requestData: AudioRequestData =
        audioRequest.data as AudioRequestData;
      this.logger.log(`[process] Downloading video ${requestData.url}`);
      const download = ytdl(requestData.url, { filter: 'audioonly' });
      const path = `audios/${requestData.jobId}.webm`;
      const writeStream = fs.createWriteStream(path);
      return new Promise<string>((resolve, reject) => {
        download.pipe(writeStream);
        download.on('end', () => {
          this.logger.log(`Audio saved as ${path}`);
          const audioCompleted: AudioCompleted = new AudioCompleted({
            url: requestData.url,
            user: requestData.user,
            audioFile: path,
            jobId: requestData.jobId,
          });
          this.eventBus.submit(audioCompleted);
          resolve('Completed audio processing');
          this.videoService.apply(audioCompleted);
        });

        download.on('error', (err) => {
          this.logger.error('Error:', err);
          const audioFailure: AudioFailure = new AudioFailure({
            url: requestData.url,
            user: requestData.user,
            jobId: requestData.jobId,
            error: err.message,
          });
          this.eventBus.submit(audioFailure);
          this.videoService.apply(audioFailure);
          reject('Unable to download the audio');
        });
      });
    } catch (e) {
      this.logger.error(e);
      const audioFailure: AudioFailure = new AudioFailure({
        url: audioRequest?.data?.url,
        user: audioRequest?.data?.user,
        jobId: audioRequest?.data?.jobId,
        error: `Unable to download the audio ${e.message}`,
      });
      this.videoService.apply(audioFailure);
      this.eventBus.submit(audioFailure);
    }
  }
}
