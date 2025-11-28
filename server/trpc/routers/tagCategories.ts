import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../index';
import {
  getTagCategoryList,
  createTagCategory,
  updateTagCategory,
  deleteTagCategory,
} from '../../services/tagCategories';
import { TRPCError } from '@trpc/server';

export const tagCategoriesRouter = router({
  /**
   * Получить список категорий тегов
   */
  getList: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getTagCategoryList(input);
    }),

  /**
   * Создать категорию тегов (только админ)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const category = await createTagCategory(input);
        return {
          success: true,
          category,
          message: 'Категория успешно создана',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'Ошибка при создании категории тегов',
        });
      }
    }),

  /**
   * Обновить категорию тегов (только админ)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const category = await updateTagCategory(id, data);
        return {
          success: true,
          category,
          message: 'Категория успешно обновлена',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'Ошибка при обновлении категории тегов',
        });
      }
    }),

  /**
   * Удалить категорию тегов (только админ)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteTagCategory(input.id);
        return {
          success: true,
          message: 'Категория удалена',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при удалении категории тегов',
        });
      }
    }),
});

