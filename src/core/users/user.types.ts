export interface UserProfile {
  userId: string;
  avatar: string | null;
  timezone: string;
  language: string;
  country: string | null;
  status: "active" | "suspended" | "deleted";
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  suspendedAt: Date | null;
  suspendedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  preferences: Record<string, unknown>;
  updatedAt: Date;
}

export interface ExternalIdentity {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
  linkedAt: Date;
}

export interface UpdateUserProfileInput {
  avatar?: string | null;
  timezone?: string;
  language?: string;
  country?: string | null;
}
