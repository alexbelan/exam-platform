import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../index";
import {
  emailAuth,
  telegramAuth,
  sendRegistrationCode,
  completeRegistration,
  sendLoginCode,
  loginWithCode,
  sendPasswordResetCode as sendPasswordResetCodeService,
  resetPasswordWithCode,
  sendEmailLinkCode,
  linkEmailWithCode,
} from "../../services/auth";
import { TRPCError } from "@trpc/server";
import { passwordSchema } from "../../utils/password-validation";

export const authRouter = router({
  email: publicProcedure
    .input(
      z.object({
        email: z.email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await emailAuth(input.email, input.password);

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

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await clearUserSession(ctx.event);
    return {
      success: true,
      message: "Выход выполнен",
    };
  }),

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

  sendRegistrationCode: publicProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await sendRegistrationCode(
          input.email,
          input.firstName,
          input.lastName,
        );
        return {
          success: true,
          message: "Код регистрации отправлен на email",
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при отправке кода регистрации",
        });
      }
    }),

  verifyRegistrationCode: publicProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
        code: z
          .string()
          .length(6, { message: "Код должен состоять из 6 цифр" }),
        password: passwordSchema,
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await completeRegistration(
          input.email,
          input.code,
          input.password,
        );

        await setUserSession(ctx.event, {
          user: result.user,
          loggedInAt: new Date(),
        });

        return {
          success: true,
          message: "Регистрация успешно завершена",
          user: result.user,
        };
      } catch (error) {
        throw new TRPCError({
          code:
            error instanceof Error && error.message.includes("истек")
              ? "BAD_REQUEST"
              : error instanceof Error && error.message.includes("существует")
                ? "CONFLICT"
                : "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при завершении регистрации",
        });
      }
    }),

  /**
   * Отправить код для входа на email
   */
  sendLoginCode: publicProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await sendLoginCode(input.email);
        return {
          success: true,
          message: "Код для входа отправлен на email",
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при отправке кода для входа",
        });
      }
    }),

  /**
   * Войти с кодом верификации
   */
  verifyLoginCode: publicProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
        code: z
          .string()
          .length(6, { message: "Код должен состоять из 6 цифр" }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await loginWithCode(input.email, input.code);

        await setUserSession(ctx.event, {
          user: result.user,
          loggedInAt: new Date(),
        });

        return {
          success: true,
          message: "Вход выполнен успешно",
          user: result.user,
        };
      } catch (error) {
        throw new TRPCError({
          code:
            error instanceof Error && error.message.includes("истек")
              ? "BAD_REQUEST"
              : "UNAUTHORIZED",
          message:
            error instanceof Error ? error.message : "Ошибка при входе с кодом",
        });
      }
    }),

  // ============================================
  // СБРОС ПАРОЛЯ
  // ============================================

  /**
   * Отправить код для сброса пароля
   */
  sendPasswordResetCode: publicProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await sendPasswordResetCodeService(input.email);
        return {
          success: true,
          message: "Код для сброса пароля отправлен на email",
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при отправке кода для сброса пароля",
        });
      }
    }),

  /**
   * Сбросить пароль с кодом
   */
  resetPasswordWithCode: publicProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
        code: z
          .string()
          .length(6, { message: "Код должен состоять из 6 цифр" }),
        newPassword: passwordSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await resetPasswordWithCode(input.email, input.code, input.newPassword);
        return {
          success: true,
          message: "Пароль успешно изменен",
        };
      } catch (error) {
        throw new TRPCError({
          code:
            error instanceof Error && error.message.includes("истек")
              ? "BAD_REQUEST"
              : "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Ошибка при сбросе пароля",
        });
      }
    }),

  // ============================================
  // ПРИВЯЗКА EMAIL К TELEGRAM АККАУНТУ
  // ============================================

  /**
   * Отправить код для привязки email к Telegram аккаунту
   */
  sendEmailLinkCode: protectedProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Пользователь не авторизован",
          });
        }

        await sendEmailLinkCode(
          typeof ctx.user.id === "string" ? parseInt(ctx.user.id) : ctx.user.id,
          input.email,
        );
        return {
          success: true,
          message: "Код для привязки email отправлен",
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при отправке кода для привязки email",
        });
      }
    }),

  /**
   * Привязать email к Telegram аккаунту с кодом
   */
  linkEmailWithCode: protectedProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
        code: z
          .string()
          .length(6, { message: "Код должен состоять из 6 цифр" }),
        password: passwordSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Пользователь не авторизован",
          });
        }

        await linkEmailWithCode(
          typeof ctx.user.id === "string" ? parseInt(ctx.user.id) : ctx.user.id,
          input.email,
          input.code,
          input.password,
        );
        return {
          success: true,
          message: "Email успешно привязан к аккаунту",
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при привязке email",
        });
      }
    }),

  // ============================================
  // ПОВТОРНАЯ ОТПРАВКА КОДА
  // ============================================

  /**
   * Повторная отправка кода
   */
  resendCode: publicProcedure
    .input(
      z.object({
        email: z.email("Неверный формат email"),
        type: z.enum(["registration", "login", "password_reset", "email_link"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        switch (input.type) {
          case "registration":
            await sendRegistrationCode(input.email);
            break;
          case "login":
            await sendLoginCode(input.email);
            break;
          case "password_reset":
            await sendPasswordResetCodeService(input.email);
            break;
          case "email_link":
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Для повторной отправки кода привязки email используйте sendEmailLinkCode",
            });
          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Неверный тип кода",
            });
        }

        return {
          success: true,
          message: "Код успешно отправлен повторно",
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при повторной отправке кода",
        });
      }
    }),
});
