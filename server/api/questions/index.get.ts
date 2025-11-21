import { createError } from "h3";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const {
      page = 1,
      limit = 10,
      search,
      difficulty,
      type,
      status,
      tags,
    } = query;

    // Построение фильтров
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { content: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        where.tags = {
          some: {
            slug: {
              in: tagList,
            },
          },
        };
      }
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (type) {
      where.type = type;
    }

    if (status !== undefined) {
      where.isPublished = status === "true";
    }

    // Получение вопросов с пагинацией
    const [questions, total] = await Promise.all([
      prisma.interviewQuestion.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
        },
      }),
      prisma.interviewQuestion.count({ where }),
    ]);

    return {
      questions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении вопросов",
    });
  }
});
