import { trpc } from "#shared/lib/trpc";

export const useAsyncTestResults = () => {
  const getQuestion = async (questionId: number) => {
    return await trpc.questions.getById.query({ id: questionId });
  };

  return {
    getQuestion,
  };
};

