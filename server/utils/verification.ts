/**
 * Генерация 6-значного числового кода верификации
 * @returns 6-значная строка с нулями в начале при необходимости
 */
export function generateVerificationCode(): string {
  // Генерируем случайное число от 0 до 999999
  const code = Math.floor(Math.random() * 1000000);

  // Преобразуем в строку и добавляем ведущие нули для 6-значного формата
  return code.toString().padStart(6, "0");
}
