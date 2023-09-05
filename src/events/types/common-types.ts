export interface VideoRequest {
  url: string;
  user: string;
}

export interface VideoJob extends VideoRequest {
  jobId: string;
}
