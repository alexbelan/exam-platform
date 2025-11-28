import { z } from 'zod';
import { router, protectedProcedure } from '../index';
import {
  getStatistics,
  getIncorrectAnswers,
  updateUncorrectedQuestions,
  getFavoriteQuestions,
  getFavoriteTests,
} from '../../services/profile';
import { TRPCError } from '@trpc/server';

export const profileRouter = router({
  /**
   * Получить статистику обучения
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Пользователь не авторизован',
        });
      }

      const statistics = await getStatistics(ctx.user.id);
      return statistics;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Ошибка при получении статистики профиля',
      });
    }
  }),

  /**
   * Получить неправильные ответы
   */
  getIncorrectAnswers: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Пользователь не авторизован',
          });
        }

        return getIncorrectAnswers(ctx.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Ошибка при получении неправильных ответов',
        });
      }
    }),

  /**
   * Обновить счетчик непройденных вопросов
   */
  updateUncorrectedQuestions: protectedProcedure
    .input(
      z.object({
        questionIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Пользователь не авторизован',
          });
        }

        const result = await updateUncorrectedQuestions(
          ctx.user.id,
          input.questionIds
        );

        return {
          success: true,
          data: result,
          message: 'Счетчик непройденных вопросов обновлен',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Ошибка при обновлении счетчика непройденных вопросов',
        });
      }
    }),

  /**
   * Получить избранные вопросы
   */
  getFavoriteQuestions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Пользователь не авторизован',
          });
        }

        return getFavoriteQuestions(ctx.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Ошибка при получении избранных вопросов',
        });
      }
    }),

  /**
   * Получить избранные тесты
   */
  getFavoriteTests: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Пользователь не авторизован',
          });
        }

        return getFavoriteTests(ctx.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Ошибка при получении избранных тестов',
        });
      }
    }),
});

