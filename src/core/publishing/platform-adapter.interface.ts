export interface PlatformConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  apiKey?: string;
  [key: string]: unknown;
}

export interface PublishInput {
  caption: string;
  mediaUrls: string[];
  mediaType: string;
  hashtags?: string[];
  mentions?: string[];
  link?: string;
  location?: string;
  platformSpecific?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  response?: Record<string, unknown>;
  error?: string;
}

export interface AccountInfo {
  platformUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export abstract class PlatformAdapter {
  abstract name: string;
  abstract code: string;
  abstract supportedMediaTypes: string[];
  abstract maxCaptionLength: number;
  abstract maxHashtags: number;
  abstract supportsVideo: boolean;
  abstract supportsCarousel: boolean;

  abstract connectAccount(code: string, config: PlatformConfig): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date; accountInfo: AccountInfo }>;
  abstract disconnectAccount(accessToken: string): Promise<void>;
  abstract validateAccount(accessToken: string): Promise<boolean>;
  abstract publish(input: PublishInput, accessToken: string): Promise<PublishResult>;
  abstract getPostStatus(platformPostId: string, accessToken: string): Promise<{ status: string; url?: string }>;
  abstract healthCheck(config: PlatformConfig): Promise<boolean>;
}
