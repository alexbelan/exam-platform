export type RegistrationStep = "registration" | "verification";

export interface EmailRegistrationFormData {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface EmailVerificationFormData {
  code: string;
  password: string;
}

export interface EmailRegistrationFlowProps {
  onSuccess?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export interface EmailRegistrationFormProps {
  loading?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export interface EmailVerificationFormProps {
  email: string;
  loading?: boolean;
  canResend?: boolean;
  resendCountdown?: number;
}

export interface EmailRegistrationFormEmits {
  (event: "submit", data: EmailRegistrationFormData): void;
}

export interface EmailVerificationFormEmits {
  (event: "submit", data: EmailVerificationFormData): void;
  (event: "resend"): void;
}
