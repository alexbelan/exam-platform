import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const questionId = getRouterParam(event, "id");
    const body = await readBody(event);
    const { title, content, isPublished, categoryId, tags } = body;

    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID вопроса обязателен",
      });
    }

    // Проверка существования вопроса
    const existingQuestion = await prisma.interviewQuestion.findUnique({
      where: { id: +questionId },
    });

    if (!existingQuestion) {
      throw createError({
        statusCode: 404,
        statusMessage: "Вопрос не найден",
      });
    }

    // Подготовка данных для обновления
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    // Обновление тегов
    if (tags !== undefined && Array.isArray(tags)) {
      const validTagIds: string[] = [];

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
          select: { id: true },
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

      updateData.tags = {
        set: validTagIds.map((tagId) => ({ id: tagId })),
      };
    }

    // Обновление вопроса
    const question = await prisma.interviewQuestion.update({
      where: { id: +questionId },
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
    if (body.answers !== undefined && Array.isArray(body.answers)) {
      // Удаляем все существующие связи
      await prisma.questionAnswer.deleteMany({
        where: { questionId: +questionId },
      });

      // Создаем новые связи
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
            questionId: +questionId,
            answerId,
            isCorrect: answerData.isCorrect || false,
          },
        });
      }
    }

    // Загружаем вопрос с ответами для возврата
    const updatedQuestion = await prisma.interviewQuestion.findUnique({
      where: { id: +questionId },
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
      question: updatedQuestion,
      message: "Вопрос успешно обновлен",
    };
  } catch (error) {
    console.error("Error updating question:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении вопроса",
    });
  }
});
