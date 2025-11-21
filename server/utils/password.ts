/// <reference types="bun-types" />

// Используем встроенный Bun.password API для хеширования паролей
// Поддерживает Argon2 (по умолчанию) и bcrypt для обратной совместимости
async function hashPasswordBun(password: string): Promise<string> {
  // Используем bcrypt для совместимости с существующими хешами в базе
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10, // эквивалент rounds в bcrypt
  });
}

async function verifyPasswordBun(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Bun.password.verify() автоматически определяет алгоритм по формату хеша
  return await Bun.password.verify(password, hashedPassword);
}

export { hashPasswordBun, verifyPasswordBun };
