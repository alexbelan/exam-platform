import { prisma } from "../../utils/prisma";
import { hashPasswordBun } from "../../utils/password";

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "id");
    const body = await readBody(event);
    const { firstName, lastName, email, password, role, isActive } = body;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID пользователя обязателен",
      });
    }

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Пользователь не найден",
      });
    }

    // Проверка уникальности email (если изменился)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw createError({
          statusCode: 409,
          statusMessage: "Пользователь с таким email уже существует",
        });
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {
      firstName,
      lastName,
      email,
      role,
      isActive,
    };

    // Хеширование пароля только если он предоставлен
    if (password) {
      updateData.password = await hashPasswordBun(password);
    }

    // Обновление пользователя
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      user,
      message: "Пользователь успешно обновлен",
    };
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении пользователя",
    });
  }
});
