import { computed } from "vue";
import { trpc } from "#shared/lib/trpc";
import type { WorkspaceQuestion } from "@entities/questions-card/model/types";

export const useAsyncWorkspaceQuestionDetail = (questionId: number | (() => number)) => {
  const questionIdRef = computed(() => {
    return typeof questionId === "function" ? questionId() : questionId;
  });

  const questionKey = computed(() => `workspace-question-${questionIdRef.value}`);

  const {
    data: question,
    pending,
    error,
    refresh,
  } = useAsyncData<WorkspaceQuestion>(
    questionKey,
    async () => {
      const id = questionIdRef.value;
      const response = await trpc.questions.getById.query({ id });
      return response.question;
    },
    {
      watch: [questionIdRef],
    }
  );

  return {
    question,
    pending,
    error,
    refresh,
  };
};

