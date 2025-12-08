export type PasswordResetStep = "email" | "code";

export interface PasswordResetFormData {
  email: string;
}

export interface PasswordResetCodeFormData {
  code: string;
  newPassword: string;
}

export interface PasswordResetFlowProps {
  onSuccess?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export interface PasswordResetFormProps {
  loading?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export interface PasswordResetCodeFormProps {
  email: string;
  loading?: boolean;
  canResend?: boolean;
  resendCountdown?: number;
}

export interface PasswordResetFormEmits {
  (event: "submit", data: PasswordResetFormData): void;
}

export interface PasswordResetCodeFormEmits {
  (event: "submit", data: PasswordResetCodeFormData): void;
  (event: "resend"): void;
}
