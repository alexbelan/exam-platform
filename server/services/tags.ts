import { prisma } from '../utils/prisma';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Получить список тегов
 */
export async function getTagList(params: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
}) {
  const { search = '', categoryId, categorySlug } = params;
  const shouldPaginate = params.page !== undefined || params.limit !== undefined;

  const pageParam = Number(params.page) || 1;
  const limitParam = Number(params.limit) || DEFAULT_LIMIT;
  const page = Math.max(1, pageParam);
  const limit = Math.min(MAX_LIMIT, Math.max(1, limitParam));

  const where: Record<string, any> = {};

  if (search && typeof search === 'string') {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId && typeof categoryId === 'string') {
    const numericCategoryId = Number(categoryId);
    if (!Number.isNaN(numericCategoryId)) {
      where.categoryId = numericCategoryId;
    }
  } else if (categorySlug && typeof categorySlug === 'string') {
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
        orderBy: { name: 'asc' },
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
    orderBy: { name: 'asc' },
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
}

/**
 * Создать тег
 */
export async function createTag(data: {
  name: string;
  categoryId?: string;
}) {
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('Название тега обязательно');
  }

  const trimmedName = data.name.trim();
  const slug = slugify(trimmedName);

  if (!slug) {
    throw new Error('Не удалось сгенерировать slug для тега');
  }

  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw new Error('Указанная категория не найдена');
    }
  }

  // Проверяем, существует ли тег с таким именем или slug
  const existingTag = await prisma.tag.findFirst({
    where: {
      OR: [{ name: trimmedName }, { slug }],
    },
  });

  if (existingTag) {
    throw new Error('Тег с таким названием уже существует');
  }

  // Создаем новый тег
  return prisma.tag.create({
    data: {
      name: trimmedName,
      slug,
      ...(data.categoryId
        ? {
            category: {
              connect: { id: data.categoryId },
            },
          }
        : {}),
    },
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
}

/**
 * Обновить тег
 */
export async function updateTag(
  id: string,
  data: {
    name?: string;
    categoryId?: string | null;
  }
) {
  const existingTag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!existingTag) {
    throw new Error('Тег не найден');
  }

  const updateData: Record<string, any> = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('Название тега обязательно');
    }

    const trimmedName = data.name.trim();
    const newSlug = slugify(trimmedName);

    if (!newSlug) {
      throw new Error('Не удалось сгенерировать slug для тега');
    }

    const duplicate = await prisma.tag.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug: newSlug }],
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new Error('Тег с таким названием уже существует');
    }

    updateData.name = trimmedName;
    updateData.slug = newSlug;
  }

  if (data.categoryId !== undefined) {
    if (data.categoryId === null || data.categoryId === '') {
      updateData.categoryId = null;
    } else {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        throw new Error('Указанная категория не найдена');
      }

      updateData.categoryId = data.categoryId;
    }
  }

  return prisma.tag.update({
    where: { id },
    data: updateData,
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
}

/**
 * Удалить тег
 */
export async function deleteTag(id: string) {
  const existingTag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!existingTag) {
    throw new Error('Тег не найден');
  }

  await prisma.tag.delete({
    where: { id },
  });
}

