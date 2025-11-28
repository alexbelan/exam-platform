import { trpc } from "#shared/lib/trpc";

export const useAsyncTagFilter = () => {
  const getTags = async (params?: {
    search?: string;
    categoryId?: string;
    categorySlug?: string;
  }) => {
    return await trpc.tags.getList.query({
      search: params?.search,
      categoryId: params?.categoryId,
      categorySlug: params?.categorySlug,
    });
  };

  return {
    getTags,
  };
};
