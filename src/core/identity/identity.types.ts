export interface IdentityContext {
  user: {
    id: string;
    email: string;
    name: string;
  };
  profile: {
    avatar: string | null;
    timezone: string;
    language: string;
    country: string | null;
    status: string;
    verificationStatus: string;
  } | null;
  preferences: Record<string, unknown> | null;
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    role: string | null;
    organizationId: string | null;
  }>;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string | null;
  }>;
  permissions: string[];
  roles: string[];
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role?: string;
  profile?: {
    avatar: string | null;
    timezone: string;
    language: string;
    country: string | null;
    status: string;
    verificationStatus: string;
  };
  preferences?: Record<string, unknown>;
}
