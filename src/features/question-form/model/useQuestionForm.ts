import { computed, type Ref } from "vue";
import { trpc } from "#shared/lib/trpc";
import type { Tag } from "./types";

export function useQuestionForm() {
  const searchTags = async (query: string): Promise<Tag[]> => {
    try {
      const response = await trpc.tags.getList.query({
        page: 1,
        limit: 50,
        search: query,
      });
      return response.tags as Tag[];
    } catch (error) {
      console.error("Ошибка при поиске тегов:", error);
      return [];
    }
  };

  return {
    searchTags,
  };
}

