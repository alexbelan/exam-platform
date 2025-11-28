import { trpc } from "#shared/lib/trpc";

export const useAsyncTestQuestion = () => {
  const getQuestion = async (questionId: number) => {
    return await trpc.questions.getById.query({ id: questionId });
  };

  return {
    getQuestion,
  };
};

