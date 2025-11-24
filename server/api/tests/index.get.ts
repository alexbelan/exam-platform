import { prisma } from "../../utils/prisma";
import { getCurrentUser } from "../../utils/getUser";
import { hasPremiumAccess } from "../../utils/subscription";

const TAG_INCLUDE = {
  tags: {
    include: {
      category: true,
    },
  },
  primaryTag: {
    include: {
      category: true,
    },
  },
} as const;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const search = (query.search as string) || "";
    const tags = query.tags as string | undefined;
    const isPublishedQuery = query.isPublished as string | undefined;

    // Получаем текущего пользователя
    const user = await getCurrentUser(event);
    const isAdmin = user?.role === "ADMIN";
    const isPremium = user ? hasPremiumAccess(user) : false;

    type FindManyArgs = NonNullable<Parameters<typeof prisma.test.findMany>[0]>;
    const where: NonNullable<FindManyArgs["where"]> = {};
    const andConditions: any[] = [];

    // Поиск по названию
    if (search) {
      andConditions.push({
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      });
    }

    // Фильтрация по тегам (обычные теги ИЛИ главный тег)
    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        andConditions.push({
          OR: [
            { tags: { some: { slug: { in: tagList } } } },
            { primaryTag: { slug: { in: tagList } } },
          ],
        });
      }
    }

    // Фильтр по публикации с проверкой прав
    if (isPublishedQuery === "true") {
      where.isPublished = true;
    } else if (isPublishedQuery === "false") {
      // Только админы могут запрашивать неопубликованные
      if (isAdmin) {
        where.isPublished = false;
      } else {
        // Для не-админов игнорируем false и показываем только опубликованные
        where.isPublished = true;
      }
    } else {
      // По умолчанию показываем только опубликованные
      where.isPublished = true;
    }

    // Фильтр по премиум доступу
    if (!isPremium) {
      where.requiresPremium = false;
    }

    // Объединяем все условия через AND
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: TAG_INCLUDE,
      }),
      prisma.test.count({ where }),
    ]);

    return {
      tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении тестов",
    });
  }
});
