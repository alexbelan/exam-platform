import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../index';
import {
  getQuestionById,
  getQuestionList,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../services/questions';
import { TRPCError } from '@trpc/server';

export const questionsRouter = router({
  /**
   * Получить вопрос по ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const question = await getQuestionById(input.id, ctx.user);
        return {
          success: true,
          question,
        };
      } catch (error) {
        throw new TRPCError({
          code:
            error instanceof Error && error.message === 'Доступ запрещен'
              ? 'FORBIDDEN'
              : 'NOT_FOUND',
          message: error instanceof Error ? error.message : 'Вопрос не найден',
        });
      }
    }),

  /**
   * Получить список вопросов
   */
  getList: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        difficulty: z.string().optional(),
        type: z.string().optional(),
        status: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return getQuestionList({
        ...input,
        user: ctx.user,
      });
    }),

  /**
   * Создать вопрос (только админ)
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        isPublished: z.boolean().optional().default(false),
        requiresPremium: z.boolean().optional().default(false),
        categoryId: z.string().optional(),
        tags: z
          .array(z.union([z.string(), z.object({ id: z.string() })]))
          .optional(),
        answers: z
          .array(
            z.union([
              z.string(),
              z.object({
                id: z.string().optional(),
                text: z.string().optional(),
                isCorrect: z.boolean().optional(),
              }),
            ])
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const question = await createQuestion(input);
        return {
          success: true,
          question,
          message: 'Вопрос успешно создан',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Ошибка при создании вопроса',
        });
      }
    }),

  /**
   * Обновить вопрос (только админ)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        isPublished: z.boolean().optional(),
        requiresPremium: z.boolean().optional(),
        categoryId: z.string().optional(),
        tags: z
          .array(z.union([z.string(), z.object({ id: z.string() })]))
          .optional(),
        answers: z
          .array(
            z.union([
              z.string(),
              z.object({
                id: z.string().optional(),
                text: z.string().optional(),
                isCorrect: z.boolean().optional(),
              }),
            ])
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const question = await updateQuestion(id, data);
        return {
          success: true,
          question,
          message: 'Вопрос успешно обновлен',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Ошибка при обновлении вопроса',
        });
      }
    }),

  /**
   * Удалить вопрос (только админ)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await deleteQuestion(input.id);
        return {
          success: true,
          message: 'Вопрос успешно удален',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при удалении вопроса',
        });
      }
    }),
});

