import { trpc } from "#shared/lib/trpc";

export const useAsyncLogin = () => {
  const loginWithTelegram = async (initData: string) => {
    const result = await trpc.auth.telegram.mutate({ initData });
    return result;
  };

  return {
    loginWithTelegram,
  };
};

