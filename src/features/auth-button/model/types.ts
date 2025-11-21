export interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: "USER" | "ADMIN";
}

export interface AuthButtonProps {
  text?: boolean;
  rounded?: boolean;
  disabled?: boolean;
  severity?: "primary" | "secondary" | "success" | "info" | "warning" | "danger";
  loginLabel?: string;
  logoutLabel?: string;
  loginIcon?: string;
  logoutIcon?: string;
}

