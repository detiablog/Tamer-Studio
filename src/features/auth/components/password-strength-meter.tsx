"use client";

import { Check, X } from "lucide-react";
import { calculatePasswordStrength } from "@/features/auth/lib/password-strength";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < strength.score ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Strength: {strength.label}
      </p>
      <div className="space-y-1">
        {strength.requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
