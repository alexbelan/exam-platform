import { trpc } from "#shared/lib/trpc";

export const useAsyncProfileFavorites = () => {
  const getFavoriteQuestions = async (page: number = 1, limit: number = 12) => {
    return await trpc.profile.getFavoriteQuestions.query({ page, limit });
  };

  const getFavoriteTests = async (page: number = 1, limit: number = 12) => {
    return await trpc.profile.getFavoriteTests.query({ page, limit });
  };

  return {
    getFavoriteQuestions,
    getFavoriteTests,
  };
};
