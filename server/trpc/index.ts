import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

// Экспортируем функцию для создания роутеров
export const router = t.router;

// Публичная процедура (доступна всем)
export const publicProcedure = t.procedure;

// Защищенная процедура (требует авторизации)
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Требуется авторизация',
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user, // Теперь user гарантированно не null
      },
    });
  })
);

// Процедура только для админов
export const adminProcedure = protectedProcedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (ctx.user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Доступ запрещен',
      });
    }
    return next({ ctx });
  })
);

