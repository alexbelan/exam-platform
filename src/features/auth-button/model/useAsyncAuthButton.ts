import { trpc } from "#shared/lib/trpc";

export const useAsyncAuthButton = () => {
  const logout = async () => {
    await trpc.auth.logout.mutate();
  };

  return {
    logout,
  };
};

