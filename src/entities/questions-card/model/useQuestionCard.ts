import { computed, toRef } from "vue";
import type { QuestionCardLogicProps } from "./types";

export function useQuestionCard(props: QuestionCardLogicProps) {
  // Используем isFavorite из вопроса напрямую
  const questionRef = toRef(props, "question");

  const isBookmarked = computed(() => {
    return questionRef.value.isFavorite ?? false;
  });

  const open = () => props.onOpen(props.question.id);
  const toggleBookmark = () => props.onToggleBookmark(props.question.id);

  return {
    isBookmarked,
    open,
    toggleBookmark,
  };
}
