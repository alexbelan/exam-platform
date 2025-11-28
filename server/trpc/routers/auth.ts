import { z } from "zod";
import { router, publicProcedure } from "../index";
import { emailAuth, telegramAuth, getUserById } from "../../services/auth";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  /**
   * Авторизация через email/password
   */
  email: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await emailAuth(input.email, input.password);

        // Создаем сессию
        // @ts-ignore - setUserSession доступен глобально в Nuxt
        await setUserSession(ctx.event, {
          user: result.user,
          loggedInAt: new Date(),
        });

        return {
          success: true,
          message: "Успешная авторизация",
          user: result.user,
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            error instanceof Error ? error.message : "Ошибка авторизации",
        });
      }
    }),

  /**
   * Авторизация через Telegram
   */
  telegram: publicProcedure
    .input(z.object({ initData: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await telegramAuth(input.initData);

        // Создаем сессию
        // @ts-ignore - setUserSession доступен глобально в Nuxt
        await setUserSession(ctx.event, {
          user: result.user,
          loggedInAt: new Date(),
        });

        return {
          success: true,
          message: result.isNewUser
            ? "Регистрация и вход успешны"
            : "Вход выполнен успешно",
          isNewUser: result.isNewUser,
          user: result.user,
        };
      } catch (error) {
        throw new TRPCError({
          code:
            error instanceof Error && error.message.includes("подписаться")
              ? "FORBIDDEN"
              : error instanceof Error && error.message.includes("Неверные")
              ? "UNAUTHORIZED"
              : "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Ошибка авторизации",
        });
      }
    }),

  /**
   * Выход
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    // @ts-ignore - clearUserSession доступен глобально в Nuxt
    await clearUserSession(ctx.event);
    return {
      success: true,
      message: "Выход выполнен",
    };
  }),

  /**
   * Получить текущего пользователя
   */
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Пользователь не авторизован",
      });
    }

    return {
      success: true,
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        firstName: ctx.user.firstName,
        lastName: ctx.user.lastName,
        role: ctx.user.role,
      },
      session: {
        loggedInAt: ctx.session.loggedInAt,
      },
    };
  }),
});
