export interface PasswordStrengthRequirement {
  label: string;
  met: boolean;
}

export type PasswordStrengthLabel = "Weak" | "Fair" | "Good" | "Strong";

export interface PasswordStrengthResult {
  score: number;
  label: PasswordStrengthLabel;
  color: string;
  requirements: PasswordStrengthRequirement[];
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements: PasswordStrengthRequirement[] = [
    { label: "At least 12 characters", met: password.length >= 12 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  if (metCount <= 1) {
    return { score: 1, label: "Weak", color: "bg-red-500", requirements };
  }
  if (metCount <= 2) {
    return { score: 2, label: "Fair", color: "bg-orange-500", requirements };
  }
  if (metCount <= 4) {
    return { score: 3, label: "Good", color: "bg-yellow-500", requirements };
  }
  return { score: 4, label: "Strong", color: "bg-green-500", requirements };
}
