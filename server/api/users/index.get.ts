import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { page = 1, limit = 10, search, role, status } = query;

    // Построение фильтров
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: "insensitive" } },
        { lastName: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status !== undefined) {
      where.isActive = status === "true";
    }

    // Получение пользователей с пагинацией
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              submittedQuestions: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении пользователей",
    });
  }
});
