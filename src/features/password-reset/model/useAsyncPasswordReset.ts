import { trpc } from "#shared/lib/trpc";

export const useAsyncPasswordReset = () => {
  const sendPasswordResetCode = async (email: string) => {
    return await trpc.auth.sendPasswordResetCode.mutate({ email });
  };

  const resetPasswordWithCode = async (
    email: string,
    code: string,
    newPassword: string,
  ) => {
    return await trpc.auth.resetPasswordWithCode.mutate({
      email,
      code,
      newPassword,
    });
  };

  const resendCode = async (email: string) => {
    return await trpc.auth.resendCode.mutate({
      email,
      type: "password_reset",
    });
  };

  return {
    sendPasswordResetCode,
    resetPasswordWithCode,
    resendCode,
  };
};
