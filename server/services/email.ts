import nodemailer from "nodemailer";
import {
  getRegistrationVerificationTemplate,
  getLoginVerificationTemplate,
  getPasswordResetTemplate,
  getEmailChangeTemplate,
} from "./templates/email-templates";

/**
 * Получить конфигурацию SMTP из runtimeConfig
 */
function getSmtpConfig() {
  const runtimeConfig = useRuntimeConfig();

  const port = runtimeConfig.smtpPort
    ? Number.parseInt(String(runtimeConfig.smtpPort), 10)
    : 587;

  const isSecurePort = port === 465;
  const isSecure = runtimeConfig.smtpSecure === true || isSecurePort;

  return {
    host: String(runtimeConfig.smtpHost || ""),
    port,
    secure: isSecure,
    auth: {
      user: String(runtimeConfig.smtpUser || ""),
      pass: String(runtimeConfig.smtpPassword || ""),
    },
  };
}

/**
 * Создать транспортер nodemailer
 */
function createTransporter() {
  const config = getSmtpConfig();

  if (!config.host || !config.auth.user || !config.auth.pass) {
    throw new Error(
      "SMTP конфигурация неполная. Проверьте переменные окружения.",
    );
  }

  return nodemailer.createTransport(config);
}

/**
 * Получить отправителя из конфигурации
 */
function getFromAddress() {
  const runtimeConfig = useRuntimeConfig();
  const companyName = String(runtimeConfig.companyName || "");
  const fromName = runtimeConfig.smtpFromName || companyName || "Система";
  const fromEmail = runtimeConfig.smtpFrom || runtimeConfig.smtpUser;

  return {
    name: fromName,
    address: fromEmail,
  };
}

export async function sendVerificationCode(
  email: string,
  code: string,
  type: "registration" | "login",
  firstName?: string,
): Promise<void> {
  try {
    const transporter = createTransporter();
    const from = getFromAddress();

    let template;
    if (type === "registration") {
      template = getRegistrationVerificationTemplate(code, firstName);
    } else {
      template = getLoginVerificationTemplate(code);
    }

    await transporter.sendMail({
      from,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error("Ошибка при отправке кода верификации:", error);
    throw new Error("Не удалось отправить код верификации. Попробуйте позже.");
  }
}

export async function sendPasswordResetCode(
  email: string,
  code: string,
): Promise<void> {
  try {
    const transporter = createTransporter();
    const from = getFromAddress();
    const template = getPasswordResetTemplate(code);

    await transporter.sendMail({
      from,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error("Ошибка при отправке кода сброса пароля:", error);
    throw new Error(
      "Не удалось отправить код для сброса пароля. Попробуйте позже.",
    );
  }
}

/**
 * Отправить код для изменения email
 */
export async function sendEmailChangeCode(
  email: string,
  code: string,
  newEmail: string,
): Promise<void> {
  try {
    const transporter = createTransporter();
    const from = getFromAddress();
    const template = getEmailChangeTemplate(code, newEmail);

    await transporter.sendMail({
      from,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error("Ошибка при отправке кода изменения email:", error);
    throw new Error(
      "Не удалось отправить код для изменения email. Попробуйте позже.",
    );
  }
}
