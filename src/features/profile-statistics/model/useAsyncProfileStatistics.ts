import { trpc } from "#shared/lib/trpc";

export const useAsyncProfileStatistics = () => {
  const getStatistics = async () => {
    return await trpc.profile.getStatistics.query();
  };

  return {
    getStatistics,
  };
};
