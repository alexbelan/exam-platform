import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      title,
      content,
      isPublished = false,
      categoryId = "",
      tags = [],
    } = body;

    if (!title || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: "Заголовок и содержание обязательны",
      });
    }

    // Обработка тегов
    const validTagIds: string[] = [];

    if (Array.isArray(tags)) {
      for (const tag of tags) {
        let candidate: string | null = null;

        if (typeof tag === "string") {
          candidate = tag;
        } else if (tag && typeof tag === "object" && "id" in tag) {
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
          throw createError({
            statusCode: 404,
            statusMessage: `Тег "${candidate}" не найден`,
          });
        }

        if (!validTagIds.includes(existingTag.id)) {
          validTagIds.push(existingTag.id);
        }
      }
    }

    // Создание вопроса
    const question = await prisma.interviewQuestion.create({
      data: {
        title,
        content,
        isPublished: Boolean(isPublished),
        categoryId: categoryId || "",
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
    if (body.answers !== undefined && Array.isArray(body.answers)) {
      for (const answerData of body.answers) {
        let answerId: string;

        if (typeof answerData === "string") {
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
        } else if (typeof answerData === "object" && answerData.id) {
          answerId = answerData.id;
        } else {
          continue;
        }

        // Создаем связь
        await prisma.questionAnswer.create({
          data: {
            questionId: question.id,
            answerId,
            isCorrect: answerData.isCorrect || false,
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

    return {
      success: true,
      question: questionWithAnswers,
      message: "Вопрос успешно создан",
    };
  } catch (error) {
    console.error("Error creating question:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании вопроса",
    });
  }
});
