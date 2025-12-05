import { useTagFilter } from "@features/tag-filter/model/useTagFilter";
import type {
  TagFilterEmits,
  TagFilterTag,
} from "@features/tag-filter/model/types";
import type { Ref } from "vue";

export function useTagFilterContent(
  modelValue: Ref<string[]>,
  emit: TagFilterEmits
) {
  const {
    pending,
    error,
    isEmpty,
    groupedCategories,
    isCategoryExpanded,
    toggleCategory,
    isSelected,
    toggleTag,
    getTagColor,
  } = useTagFilter(modelValue, emit);

  return {
    pending,
    error,
    isEmpty,
    groupedCategories,
    isCategoryExpanded,
    toggleCategory,
    isSelected,
    toggleTag,
    getTagColor,
  };
}
