import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { search = "" } = query;

    const where: any = {};

    if (search && typeof search === "string") {
      where.text = { contains: search, mode: "insensitive" };
    }

    const answers = await prisma.answer.findMany({
      where,
      orderBy: { text: "asc" },
      take: 50, // Ограничиваем количество результатов
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
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении ответов",
    });
  }
});


