import { trpc } from "#shared/lib/trpc";

export const useAsyncLogin = () => {
  const loginWithTelegram = async (initData: string) => {
    const result = await trpc.auth.telegram.mutate({ initData });
    return result;
  };

  const loginWithEmail = async (email: string, password: string) => {
    const result = await trpc.auth.email.mutate({ email, password });
    return result;
  };

  const sendLoginCode = async (email: string) => {
    const result = await trpc.auth.sendLoginCode.mutate({ email });
    return result;
  };

  const verifyLoginCode = async (email: string, code: string) => {
    const result = await trpc.auth.verifyLoginCode.mutate({ email, code });
    return result;
  };

  return {
    loginWithTelegram,
    loginWithEmail,
    sendLoginCode,
    verifyLoginCode,
  };
};
