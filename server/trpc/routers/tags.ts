import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../index';
import {
  getTagList,
  createTag,
  updateTag,
  deleteTag,
} from '../../services/tags';
import { TRPCError } from '@trpc/server';

export const tagsRouter = router({
  /**
   * Получить список тегов
   */
  getList: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
        search: z.string().optional(),
        categoryId: z.string().optional(),
        categorySlug: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getTagList(input);
    }),

  /**
   * Создать тег (только админ)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const tag = await createTag(input);
        return {
          success: true,
          tag,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Ошибка при создании тега',
        });
      }
    }),

  /**
   * Обновить тег (только админ)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        categoryId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const tag = await updateTag(id, data);
        return {
          success: true,
          tag,
          message: 'Тег успешно обновлен',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Ошибка при обновлении тега',
        });
      }
    }),

  /**
   * Удалить тег (только админ)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteTag(input.id);
        return {
          success: true,
          message: 'Тег удален',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при удалении тега',
        });
      }
    }),
});

