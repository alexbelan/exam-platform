import { trpc } from "#shared/lib/trpc";

export const useAsyncWorkspaceProfileDisplay = () => {
  const getIncorrectAnswers = async (page: number = 1, limit: number = 12) => {
    return await trpc.profile.getIncorrectAnswers.query({ page, limit });
  };

  return {
    getIncorrectAnswers,
  };
};

