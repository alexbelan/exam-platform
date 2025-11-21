import { prisma } from "../../utils/prisma";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { search = "" } = query;
    const shouldPaginate =
      query.page !== undefined || query.limit !== undefined;

    const pageParam = Number(query.page) || 1;
    const limitParam = Number(query.limit) || DEFAULT_LIMIT;
    const page = Math.max(1, pageParam);
    const limit = Math.min(MAX_LIMIT, Math.max(1, limitParam));

    const where: Record<string, any> = {};

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (shouldPaginate) {
      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: {
                tags: true,
              },
            },
          },
        }),
        prisma.category.count({ where }),
      ]);

      return {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      take: Math.min(MAX_LIMIT, 50),
      include: {
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    return {
      categories,
    };
  } catch (error) {
    console.error("Error fetching tag categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении категорий тегов",
    });
  }
});
