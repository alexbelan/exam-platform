import { prisma } from "../../utils/prisma";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { search = "", categoryId, categorySlug } = query;
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

    if (categoryId && typeof categoryId === "string") {
      const numericCategoryId = Number(categoryId);
      if (!Number.isNaN(numericCategoryId)) {
        where.categoryId = numericCategoryId;
      }
    } else if (categorySlug && typeof categorySlug === "string") {
      where.category = {
        slug: categorySlug,
      };
    }

    if (shouldPaginate) {
      const [tags, total] = await Promise.all([
        prisma.tag.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: "asc" },
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
        }),
        prisma.tag.count({ where }),
      ]);

      return {
        tags,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      take: Math.min(MAX_LIMIT, 50),
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
    });

    return {
      tags,
    };
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении тегов",
    });
  }
});
