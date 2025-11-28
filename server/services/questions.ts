import { prisma } from '../utils/prisma';
import { hasPremiumAccess } from '../utils/subscription';
import type { Prisma } from '@prisma/client';

/**
 * Получить вопрос по ID
 */
export async function getQuestionById(
  id: number,
  user: { role: string } | null
) {
  const question = await prisma.interviewQuestion.findUnique({
    where: { id },
    include: {
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
      questionAnswers: {
        include: {
          answer: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  if (!question) {
    throw new Error('Вопрос не найден');
  }

  // Проверка доступа: неопубликованные вопросы доступны только админам
  const isAdmin = user?.role === 'ADMIN';
  if (!question.isPublished && !isAdmin) {
    throw new Error('Доступ запрещен');
  }

  return question;
}

/**
 * Получить список вопросов
 */
export async function getQuestionList(params: {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  type?: string;
  status?: boolean;
  tags?: string[];
  user: { role: string } | null;
}) {
  const {
    page = 1,
    limit = 10,
    search,
    difficulty,
    type,
    status,
    tags,
    user,
  } = params;

  const isAdmin = user?.role === 'ADMIN';
  const isPremium = user ? hasPremiumAccess(user) : false;

  // Построение фильтров
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (tags) {
    const tagList = String(tags)
      .split(',')
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

  // Фильтр по публикации с проверкой прав
  if (status !== undefined) {
    const statusValue = status === true;
    // Только админы могут запрашивать неопубликованные
    if (statusValue === false && !isAdmin) {
      // Для не-админов игнорируем false и показываем только опубликованные
      where.isPublished = true;
    } else {
      where.isPublished = statusValue;
    }
  } else {
    // По умолчанию показываем только опубликованные
    where.isPublished = true;
  }

  // Фильтр по премиум доступу
  if (!isPremium) {
    where.requiresPremium = false;
  }

  // Получение вопросов с пагинацией
  const [questions, total] = await Promise.all([
    prisma.interviewQuestion.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        isPublished: true,
        requiresPremium: true,
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
}

/**
 * Создать вопрос
 */
export async function createQuestion(data: {
  title: string;
  content: string;
  isPublished?: boolean;
  requiresPremium?: boolean;
  categoryId?: string;
  tags?: Array<string | { id: string }>;
  answers?: Array<
    | string
    | {
        id?: string;
        text?: string;
        isCorrect?: boolean;
      }
  >;
}) {
  if (!data.title || !data.content) {
    throw new Error('Заголовок и содержание обязательны');
  }

  // Обработка тегов
  const validTagIds: string[] = [];

  if (Array.isArray(data.tags)) {
    for (const tag of data.tags) {
      let candidate: string | null = null;

      if (typeof tag === 'string') {
        candidate = tag;
      } else if (tag && typeof tag === 'object' && 'id' in tag) {
        candidate = tag.id;
      }

      if (!candidate) {
        continue;
      }

      const existingTag = await prisma.tag.findFirst({
        where: {
          OR: [{ id: candidate }, { slug: candidate }],
        },
        select: {
          id: true,
        },
      });

      if (!existingTag) {
        throw new Error(`Тег "${candidate}" не найден`);
      }

      if (!validTagIds.includes(existingTag.id)) {
        validTagIds.push(existingTag.id);
      }
    }
  }

  // Создание вопроса
  const question = await prisma.interviewQuestion.create({
    data: {
      title: data.title,
      content: data.content,
      isPublished: Boolean(data.isPublished),
      requiresPremium: Boolean(data.requiresPremium),
      categoryId: data.categoryId || '',
      tags: {
        connect: validTagIds.map((tagId) => ({ id: tagId })),
      },
    },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  // Обработка ответов
  if (data.answers !== undefined && Array.isArray(data.answers)) {
    for (const answerData of data.answers) {
      let answerId: string;

      if (typeof answerData === 'string') {
        // Если это строка (ID или текст), ищем или создаем ответ
        const existingAnswer = await prisma.answer.findFirst({
          where: {
            OR: [{ id: answerData }, { text: answerData }],
          },
        });

        if (existingAnswer) {
          answerId = existingAnswer.id;
        } else {
          const newAnswer = await prisma.answer.create({
            data: { text: answerData },
          });
          answerId = newAnswer.id;
        }
      } else if (typeof answerData === 'object' && answerData.id) {
        answerId = answerData.id;
      } else if (typeof answerData === 'object' && answerData.text) {
        // Создаем новый ответ из текста
        const newAnswer = await prisma.answer.create({
          data: { text: answerData.text },
        });
        answerId = newAnswer.id;
      } else {
        continue;
      }

      // Создаем связь
      await prisma.questionAnswer.create({
        data: {
          questionId: question.id,
          answerId,
          isCorrect: (answerData as any).isCorrect || false,
        },
      });
    }
  }

  // Загружаем вопрос с ответами для возврата
  const questionWithAnswers = await prisma.interviewQuestion.findUnique({
    where: { id: question.id },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      questionAnswers: {
        include: {
          answer: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  return questionWithAnswers!;
}

/**
 * Обновить вопрос
 */
export async function updateQuestion(
  id: number,
  data: {
    title?: string;
    content?: string;
    isPublished?: boolean;
    requiresPremium?: boolean;
    categoryId?: string;
    tags?: Array<string | { id: string }>;
    answers?: Array<
      | string
      | {
          id?: string;
          text?: string;
          isCorrect?: boolean;
        }
    >;
  }
) {
  // Проверка существования вопроса
  const existingQuestion = await prisma.interviewQuestion.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    throw new Error('Вопрос не найден');
  }

  // Подготовка данных для обновления
  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.isPublished !== undefined)
    updateData.isPublished = data.isPublished;
  if (data.requiresPremium !== undefined)
    updateData.requiresPremium = data.requiresPremium;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  // Обновление тегов
  if (data.tags !== undefined && Array.isArray(data.tags)) {
    const validTagIds: string[] = [];

    for (const tag of data.tags) {
      let candidate: string | null = null;

      if (typeof tag === 'string') {
        candidate = tag;
      } else if (tag && typeof tag === 'object' && 'id' in tag) {
        candidate = tag.id;
      }

      if (!candidate) {
        continue;
      }

      const existingTag = await prisma.tag.findFirst({
        where: {
          OR: [{ id: candidate }, { slug: candidate }],
        },
        select: { id: true },
      });

      if (!existingTag) {
        throw new Error(`Тег "${candidate}" не найден`);
      }

      if (!validTagIds.includes(existingTag.id)) {
        validTagIds.push(existingTag.id);
      }
    }

    updateData.tags = {
      set: validTagIds.map((tagId) => ({ id: tagId })),
    };
  }

  // Обновление вопроса
  const question = await prisma.interviewQuestion.update({
    where: { id },
    data: updateData,
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  // Обработка ответов
  if (data.answers !== undefined && Array.isArray(data.answers)) {
    // Удаляем все существующие связи
    await prisma.questionAnswer.deleteMany({
      where: { questionId: id },
    });

    // Создаем новые связи
    for (const answerData of data.answers) {
      let answerId: string;

      if (typeof answerData === 'string') {
        // Если это строка (ID или текст), ищем или создаем ответ
        const existingAnswer = await prisma.answer.findFirst({
          where: {
            OR: [{ id: answerData }, { text: answerData }],
          },
        });

        if (existingAnswer) {
          answerId = existingAnswer.id;
        } else {
          const newAnswer = await prisma.answer.create({
            data: { text: answerData },
          });
          answerId = newAnswer.id;
        }
      } else if (typeof answerData === 'object' && answerData.id) {
        answerId = answerData.id;
      } else if (typeof answerData === 'object' && answerData.text) {
        // Создаем новый ответ из текста
        const newAnswer = await prisma.answer.create({
          data: { text: answerData.text },
        });
        answerId = newAnswer.id;
      } else {
        continue;
      }

      // Создаем связь
      await prisma.questionAnswer.create({
        data: {
          questionId: id,
          answerId,
          isCorrect: answerData.isCorrect || false,
        },
      });
    }
  }

  // Загружаем вопрос с ответами для возврата
  const updatedQuestion = await prisma.interviewQuestion.findUnique({
    where: { id },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      questionAnswers: {
        include: {
          answer: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  return updatedQuestion!;
}

/**
 * Удалить вопрос
 */
export async function deleteQuestion(id: number) {
  // Проверка существования вопроса
  const existingQuestion = await prisma.interviewQuestion.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    throw new Error('Вопрос не найден');
  }

  // Удаление вопроса
  await prisma.interviewQuestion.delete({
    where: { id },
  });
}

