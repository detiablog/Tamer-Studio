import { PlatformAdapter } from "../platform-adapter.interface";
import type { PlatformConfig, PublishInput, PublishResult, AccountInfo } from "../platform-adapter.interface";

export class TikTokAdapter extends PlatformAdapter {
  name = "TikTok";
  code = "tiktok";
  supportedMediaTypes = ["image", "video"];
  maxCaptionLength = 2200;
  maxHashtags = 30;
  supportsVideo = true;
  supportsCarousel = false;

  async connectAccount(_code: string, _config: PlatformConfig): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date; accountInfo: AccountInfo }> {
    return {
      accessToken: "mock_tiktok_access_token",
      refreshToken: "mock_tiktok_refresh_token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      accountInfo: {
        platformUserId: "mock_tiktok_user_id",
        username: "mock_tiktok_user",
        displayName: "Mock TikTok User",
        avatarUrl: "",
      },
    };
  }

  async disconnectAccount(_accessToken: string): Promise<void> {}

  async validateAccount(_accessToken: string): Promise<boolean> {
    return true;
  }

  async publish(_input: PublishInput, _accessToken: string): Promise<PublishResult> {
    return {
      success: true,
      platformPostId: "mock_tiktok_post_id",
      platformUrl: "https://www.tiktok.com/@user/video/mock",
      response: { mock: true },
    };
  }

  async getPostStatus(_platformPostId: string, _accessToken: string): Promise<{ status: string; url?: string }> {
    return { status: "published", url: "https://www.tiktok.com/@user/video/mock" };
  }

  async healthCheck(_config: PlatformConfig): Promise<boolean> {
    return true;
  }
}
