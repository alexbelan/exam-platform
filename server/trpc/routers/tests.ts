import { z } from 'zod';
import {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '../index';
import {
  getTestById,
  getTestList,
  createTest,
  updateTest,
  deleteTest,
  generateTestQuestions,
} from '../../services/tests';
import { TRPCError } from '@trpc/server';

export const testsRouter = router({
  /**
   * Получить тест по ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const test = await getTestById(input.id, ctx.user);
        return {
          success: true,
          test,
          message: 'Данные теста получены',
        };
      } catch (error) {
        throw new TRPCError({
          code:
            error instanceof Error && error.message === 'Доступ запрещен'
              ? 'FORBIDDEN'
              : 'NOT_FOUND',
          message: error instanceof Error ? error.message : 'Тест не найден',
        });
      }
    }),

  /**
   * Получить список тестов
   */
  getList: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return getTestList({
        ...input,
        user: ctx.user,
      });
    }),

  /**
   * Создать тест (только админ)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        questionCount: z.number().min(1),
        isPublished: z.boolean().optional().default(false),
        requiresPremium: z.boolean().optional().default(false),
        tags: z.array(z.union([z.number(), z.object({ id: z.number() })])).optional(),
        primaryTag: z.union([z.number(), z.object({ id: z.number() }), z.null()]).optional(),
        questionIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const test = await createTest(input);
        return {
          success: true,
          test,
          message: 'Тест создан',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Ошибка при создании теста',
        });
      }
    }),

  /**
   * Обновить тест (только админ)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        questionCount: z.number().min(1).optional(),
        isPublished: z.boolean().optional(),
        requiresPremium: z.boolean().optional(),
        tags: z.array(z.union([z.number(), z.object({ id: z.number() })])).optional(),
        primaryTag: z.union([z.number(), z.object({ id: z.number() }), z.null()]).optional(),
        questionIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const test = await updateTest(id, data);
        return {
          success: true,
          test,
          message: 'Тест обновлен',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Ошибка при обновлении теста',
        });
      }
    }),

  /**
   * Удалить тест (только админ)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await deleteTest(input.id);
        return {
          success: true,
          message: 'Тест удален',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при удалении теста',
        });
      }
    }),

  /**
   * Сгенерировать вопросы для теста
   */
  generateQuestions: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await generateTestQuestions(input.id);
        return {
          success: true,
          questions: result.questions,
          message: 'Вопросы сгенерированы',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Ошибка при генерации вопросов',
        });
      }
    }),
});

