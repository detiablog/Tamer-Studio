import { PlatformAdapter } from "../platform-adapter.interface";
import type { PlatformConfig, PublishInput, PublishResult, AccountInfo } from "../platform-adapter.interface";

export class InstagramAdapter extends PlatformAdapter {
  name = "Instagram";
  code = "instagram";
  supportedMediaTypes = ["image", "video", "carousel"];
  maxCaptionLength = 2200;
  maxHashtags = 30;
  supportsVideo = true;
  supportsCarousel = true;

  async connectAccount(_code: string, _config: PlatformConfig): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date; accountInfo: AccountInfo }> {
    return {
      accessToken: "mock_instagram_access_token",
      refreshToken: undefined,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      accountInfo: {
        platformUserId: "mock_instagram_user_id",
        username: "mock_instagram_user",
        displayName: "Mock Instagram User",
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
      platformPostId: "mock_instagram_post_id",
      platformUrl: "https://www.instagram.com/p/mock",
      response: { mock: true },
    };
  }

  async getPostStatus(_platformPostId: string, _accessToken: string): Promise<{ status: string; url?: string }> {
    return { status: "published", url: "https://www.instagram.com/p/mock" };
  }

  async healthCheck(_config: PlatformConfig): Promise<boolean> {
    return true;
  }
}
