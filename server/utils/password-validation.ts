/**
 * Улучшенная валидация паролей
 */

/**
 * Проверка сложности пароля
 * @param password - пароль для проверки
 * @returns объект с результатами валидации
 */
/**
 * Zod схема для валидации паролей
 */
import { z } from "zod";

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Минимальная длина
  if (password.length < 8) {
    errors.push("Пароль должен быть не менее 8 символов");
  }

  // Максимальная длина (защита от атак)
  if (password.length > 128) {
    errors.push("Пароль не должен превышать 128 символов");
  }

  // Проверка на наличие хотя бы одной буквы
  if (!/[a-zA-Zа-яА-Я]/.test(password)) {
    errors.push("Пароль должен содержать хотя бы одну букву");
  }

  // Проверка на наличие хотя бы одной цифры
  if (!/\d/.test(password)) {
    errors.push("Пароль должен содержать хотя бы одну цифру");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидация пароля с сообщением об ошибке
 * @param password - пароль для проверки
 * @returns сообщение об ошибке или null если пароль валиден
 */
export function validatePassword(password: string): string | null {
  const { valid, errors } = validatePasswordStrength(password);

  if (!valid) {
    return errors.join(". ");
  }

  return null;
}

export const passwordSchema = z
  .string()
  .min(8, { message: "Пароль должен быть не менее 8 символов" })
  .max(128, { message: "Пароль не должен превышать 128 символов" })
  .refine((password) => /[a-zA-Zа-яА-Я]/.test(password), {
    message: "Пароль должен содержать хотя бы одну букву",
  })
  .refine((password) => /\d/.test(password), {
    message: "Пароль должен содержать хотя бы одну цифру",
  });
