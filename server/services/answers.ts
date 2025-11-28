import { prisma } from "../utils/prisma";

/**
 * Получить список ответов
 */
export async function getAnswerList(params: { search?: string }) {
  const { search = "" } = params;

  const where: any = {};

  if (search && typeof search === "string") {
    where.text = { contains: search, mode: "insensitive" };
  }

  const answers = await prisma.answer.findMany({
    where,
    orderBy: { text: "asc" },
    take: 50,
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    answers,
  };
}

/**
 * Создать ответ
 */
export async function createAnswer(data: { text: string }) {
  if (!data.text || typeof data.text !== "string" || !data.text.trim()) {
    throw new Error("Текст ответа обязателен");
  }

  const answer = await prisma.answer.create({
    data: {
      text: data.text.trim(),
    },
  });

  return {
    id: answer.id,
    text: answer.text,
    createdAt: answer.createdAt,
    updatedAt: answer.updatedAt,
  };
}
