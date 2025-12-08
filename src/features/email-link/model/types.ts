export type EmailLinkStep = "email" | "code";

export interface EmailLinkFormData {
  email: string;
}

export interface EmailLinkCodeFormData {
  code: string;
  password: string;
}

export interface EmailLinkFlowProps {
  onSuccess?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export interface EmailLinkFormProps {
  loading?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export interface EmailLinkCodeFormProps {
  email: string;
  loading?: boolean;
  canResend?: boolean;
  resendCountdown?: number;
}

export interface EmailLinkFormEmits {
  (event: "submit", data: EmailLinkFormData): void;
}

export interface EmailLinkCodeFormEmits {
  (event: "submit", data: EmailLinkCodeFormData): void;
  (event: "resend"): void;
}
