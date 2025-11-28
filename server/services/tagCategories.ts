import { prisma } from "../utils/prisma";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const isHexColor = (value: string) =>
  /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);

/**
 * Получить список категорий тегов
 */
export async function getTagCategoryList(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { search = "" } = params;
  const shouldPaginate =
    params.page !== undefined || params.limit !== undefined;

  const pageParam = Number(params.page) || 1;
  const limitParam = Number(params.limit) || DEFAULT_LIMIT;
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
}

/**
 * Создать категорию тегов
 */
export async function createTagCategory(data: {
  name: string;
  color?: string;
}) {
  const { name, color } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Название категории обязательно");
  }

  if (
    color !== undefined &&
    (typeof color !== "string" || !isHexColor(color.trim().toLowerCase()))
  ) {
    throw new Error("Цвет должен быть в формате HEX, например #3b82f6");
  }

  const trimmedName = name.trim();
  const slug = slugify(trimmedName);

  if (!slug) {
    throw new Error("Не удалось сгенерировать slug для категории");
  }

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: trimmedName }, { slug }],
    },
  });

  if (existing) {
    throw new Error("Категория с таким названием уже существует");
  }

  return prisma.category.create({
    data: {
      name: trimmedName,
      slug,
      color: color ? color.trim().toLowerCase() : undefined,
    },
    include: {
      _count: {
        select: {
          tags: true,
        },
      },
    },
  });
}

/**
 * Обновить категорию тегов
 */
export async function updateTagCategory(
  id: string,
  data: {
    name?: string;
    color?: string;
  }
) {
  const { name, color } = data;

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Категория не найдена");
  }

  if (
    color !== undefined &&
    (typeof color !== "string" || !isHexColor(color.trim().toLowerCase()))
  ) {
    throw new Error("Цвет должен быть в формате HEX, например #3b82f6");
  }

  if (name === undefined && color === undefined) {
    // Если ничего не передано, просто возвращаем категорию
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });
  }

  const updateData: Record<string, any> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new Error("Название категории обязательно");
    }

    const trimmedName = name.trim();
    const newSlug = slugify(trimmedName);

    if (!newSlug) {
      throw new Error("Не удалось сгенерировать slug для категории");
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug: newSlug }],
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new Error("Категория с таким названием уже существует");
    }

    updateData.name = trimmedName;
    updateData.slug = newSlug;
  }

  if (color !== undefined) {
    updateData.color = color.trim().toLowerCase();
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      _count: {
        select: {
          tags: true,
        },
      },
    },
  });
}

/**
 * Удалить категорию тегов
 */
export async function deleteTagCategory(id: string) {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tags: true,
        },
      },
    },
  });

  if (!existingCategory) {
    throw new Error("Категория не найдена");
  }

  if (existingCategory._count.tags > 0) {
    throw new Error(
      "Невозможно удалить категорию, пока в ней есть связанные теги"
    );
  }

  await prisma.category.delete({
    where: { id },
  });
}
