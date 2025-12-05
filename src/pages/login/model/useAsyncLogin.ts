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

  return {
    loginWithTelegram,
    loginWithEmail,
  };
};

