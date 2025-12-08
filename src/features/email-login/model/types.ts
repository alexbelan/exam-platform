export type LoginStep = "email" | "code";

export interface EmailLoginFormProps {
  showBackButton?: boolean;
  onBack?: () => void;
  onSuccess?: () => void;
  loading?: boolean;
}
export interface EmailLoginCodeFormProps {
  email: string;
  loading?: boolean;
  canResend?: boolean;
  resendCountdown?: number;
}

export interface EmailLoginFormEmits {
  (event: "submit", email: string): void;
}

export interface EmailLoginCodeFormEmits {
  (event: "submit", code: string): void;
  (event: "resend"): void;
}
