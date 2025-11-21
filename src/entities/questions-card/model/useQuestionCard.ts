import { computed } from "vue";
import type { QuestionCardLogicProps } from "./types";

export function useQuestionCard(props: QuestionCardLogicProps) {
  const isBookmarked = computed(() =>
    props.bookmarks.has(props.question.id)
  );

  const open = () => props.onOpen(props.question.id);
  const toggleBookmark = () => props.onToggleBookmark(props.question.id);

  return {
    isBookmarked,
    open,
    toggleBookmark,
  };
}
