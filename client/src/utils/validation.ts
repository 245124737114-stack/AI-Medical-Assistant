export interface PasswordRuleResult {
  valid: boolean;
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
  message: string | null;
}

export function validatePassword(password: string): PasswordRuleResult {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/'`~;]/.test(password),
  };

  const valid = Object.values(checks).every(Boolean);
  let message: string | null = null;
  if (!valid) {
    message =
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
  }
  return { valid, checks, message };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
