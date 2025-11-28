import { trpc } from "#shared/lib/trpc";

export const useAsyncTestsDisplay = () => {
  const getTests = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    isPublished?: boolean;
  }) => {
    return await trpc.tests.getList.query({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      isPublished: params.isPublished ?? true,
      search: params.search,
      tags: params.tags,
    });
  };

  return {
    getTests,
  };
};

