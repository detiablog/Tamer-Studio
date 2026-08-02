import { describe, it, expect } from 'vitest';
import { registerSchema } from '@/features/auth/schemas/register.schema';
import { loginSchema } from '@/features/auth/schemas/login.schema';

describe('validation', () => {
  const validRegisterData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecureP@ssw0rd',
    confirmPassword: 'SecureP@ssw0rd',
    termsAccepted: true as const,
  };

  it('accepts valid registration input', () => {
    const result = registerSchema.safeParse(validRegisterData);
    expect(result.success).toBe(true);
  });

  it('rejects registration with short name', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, name: 'Te' });
    expect(result.success).toBe(false);
  });

  it('rejects registration with invalid email', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, email: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects registration with short password', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, password: 'short', confirmPassword: 'short' });
    expect(result.success).toBe(false);
  });

  it('accepts valid login input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'securepass123' });
    expect(result.success).toBe(true);
  });

  it('rejects login with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: 'securepass123' });
    expect(result.success).toBe(false);
  });

  it('rejects login with short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});
