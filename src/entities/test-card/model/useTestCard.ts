import { computed, toRef } from "vue";
import type { TestCardLogicProps } from "./types";

export function useTestCard(props: TestCardLogicProps) {
  const testRef = toRef(props, "test");

  const isBookmarked = computed(() => {
    return testRef.value.isFavorite ?? false;
  });

  const startTest = () => props.onStartTest(props.test.id);
  const toggleBookmark = () => props.onToggleBookmark(props.test.id);

  return {
    startTest,
    isBookmarked,
    toggleBookmark,
  };
}
