import { z } from 'zod';
import { router, adminProcedure } from '../index';
import {
  getUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../../services/users';
import { TRPCError } from '@trpc/server';

export const usersRouter = router({
  /**
   * Получить список пользователей (только админ)
   */
  getList: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        role: z.string().optional(),
        status: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return getUserList(input);
    }),

  /**
   * Получить пользователя по ID (только админ)
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const user = await getUserById(input.id);
        return {
          success: true,
          user,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error instanceof Error ? error.message : 'Пользователь не найден',
        });
      }
    }),

  /**
   * Создать пользователя (только админ)
   */
  create: adminProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(1),
        role: z.string().optional().default('USER'),
        isActive: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const user = await createUser(input);
        return {
          success: true,
          user,
          message: 'Пользователь успешно создан',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Ошибка при создании пользователя',
        });
      }
    }),

  /**
   * Обновить пользователя (только админ)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().min(1).optional(),
        role: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const user = await updateUser(id, data);
        return {
          success: true,
          user,
          message: 'Пользователь успешно обновлен',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Ошибка при обновлении пользователя',
        });
      }
    }),

  /**
   * Удалить пользователя (только админ)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteUser(input.id);
        return {
          success: true,
          message: 'Пользователь успешно удален',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при удалении пользователя',
        });
      }
    }),
});

