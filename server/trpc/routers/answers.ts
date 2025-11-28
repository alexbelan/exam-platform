import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../index';
import { getAnswerList, createAnswer } from '../../services/answers';
import { TRPCError } from '@trpc/server';

export const answersRouter = router({
  /**
   * Получить список ответов
   */
  getList: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getAnswerList({
        search: input.search,
      });
    }),

  /**
   * Создать ответ (только админ)
   */
  create: adminProcedure
    .input(
      z.object({
        text: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const answer = await createAnswer(input);
        return {
          success: true,
          answer,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Ошибка при создании ответа',
        });
      }
    }),
});

