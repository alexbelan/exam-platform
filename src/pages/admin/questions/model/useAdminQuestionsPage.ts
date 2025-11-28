export function useAdminQuestionsPage() {
  const openQuestion = (id: number) => {
    navigateTo(`/admin/questions/${id}`);
  };

  const createQuestion = () => {
    navigateTo("/admin/questions/new");
  };

  const importQuestions = () => {
    console.log("Импорт вопросов");
    // TODO: реализовать импорт
  };

  const viewQuestion = (question: { id: number }) => {
    navigateTo(`/admin/questions/${question.id}`);
  };

  return {
    openQuestion,
    createQuestion,
    importQuestions,
    viewQuestion,
  };
}

