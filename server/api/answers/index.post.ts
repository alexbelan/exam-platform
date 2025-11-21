import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Текст ответа обязателен",
      });
    }

    const answer = await prisma.answer.create({
      data: {
        text: text.trim(),
      },
    });

    return {
      success: true,
      answer: {
        id: answer.id,
        text: answer.text,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error creating answer:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании ответа",
    });
  }
});




