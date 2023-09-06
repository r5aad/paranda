export class VideoEntityDto {
  jobId: string;
  url?: string;
  status?: AudioRequestStatus;
  path?: string;
}

export enum AudioRequestStatus {
  REQUESTED = 'REQUESTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
