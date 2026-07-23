export interface AudioGenerationOptions {
  voice?: string;
  speed?: number;
  format?: string;
}

export interface AudioTranscriptionOptions {
  language?: string;
  format?: string;
}

export interface AudioTranscriptionResponse {
  text: string;
  language: string;
  durationSeconds: number;
  segments: Array<{ start: number; end: number; text: string }>;
}
