import { trpc } from "#shared/lib/trpc";

export const useAsyncQuestionsDisplay = () => {
  const getQuestions = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    status?: boolean;
  }) => {
    return await trpc.questions.getList.query({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search,
      tags: params.tags,
      status: params.status ?? true,
    });
  };

  return {
    getQuestions,
  };
};

