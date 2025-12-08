import { trpc } from "#shared/lib/trpc";

export const useAsyncEmailLogin = () => {
  const sendLoginCode = async (email: string) => {
    return await trpc.auth.sendLoginCode.mutate({ email });
  };

  const verifyLoginCode = async (email: string, code: string) => {
    return await trpc.auth.verifyLoginCode.mutate({ email, code });
  };

  const resendLoginCode = async (email: string) => {
    return await trpc.auth.resendCode.mutate({
      email,
      type: "login",
    });
  };

  return {
    sendLoginCode,
    verifyLoginCode,
    resendLoginCode,
  };
};
