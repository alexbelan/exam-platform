import { computed, ref, onBeforeUnmount } from "vue";
import type { WorkspaceQuestionsCatalogFilters } from "./types";

export function useWorkspaceQuestionsCatalog(
  emitOpen: (id: number) => void,
  emitToggleBookmark: (id: number) => void
) {
  const search = ref("");
  const selectedLevel = ref<string | null>(null);
  const selectedTags = ref<string[]>([]);
  const bookmarks = useState<Set<number>>(
    "workspace-question-bookmarks",
    () => new Set()
  );

  const filters = computed<WorkspaceQuestionsCatalogFilters>(() => ({
    search: search.value.trim() || undefined,
    level: selectedLevel.value || undefined,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  }));

  const hasActiveFilters = computed(
    () =>
      Boolean(search.value.trim()) ||
      Boolean(selectedLevel.value) ||
      selectedTags.value.length > 0
  );

  const resetFilters = () => {
    search.value = "";
    selectedLevel.value = null;
    selectedTags.value = [];
  };

  const handleOpen = (id: number) => {
    emitOpen(id);
  };

  const handleToggleBookmark = (id: number) => {
    if (bookmarks.value.has(id)) {
      const next = new Set(bookmarks.value);
      next.delete(id);
      bookmarks.value = next;
    } else {
      bookmarks.value = new Set([...bookmarks.value, id]);
    }
    emitToggleBookmark(id);
  };

  onBeforeUnmount(() => {
    bookmarks.value = new Set(bookmarks.value);
  });

  return {
    search,
    selectedLevel,
    selectedTags,
    filters,
    bookmarks,
    hasActiveFilters,
    resetFilters,
    handleOpen,
    handleToggleBookmark,
  };
}

