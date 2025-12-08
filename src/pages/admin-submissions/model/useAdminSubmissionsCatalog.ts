import { ref, computed } from "vue";
import type { AdminSubmissionsCatalogFilters } from "./types";
import type { Submission } from "@features/submissions-table";
import type { SubmissionsFilters } from "@features/submissions-filters/model/types";

export function useAdminSubmissionsCatalog() {
  const loading = ref(false);
  const filters = ref<AdminSubmissionsCatalogFilters>({
    page: 1,
    limit: 10,
  });
  const selectedSubmissions = ref<Submission[]>([]);

  // Моковые данные для демонстрации
  const submissions = ref<Submission[]>([
    {
      id: "1",
      title: "Вопрос о React хуках",
      content:
        "Не могу понять, как правильно использовать useEffect с зависимостями. Можете объяснить на примере?",
      status: "PENDING",
      adminResponse: null,
      isResponseSent: false,
      createdAt: new Date("2024-01-15"),
      user: {
        firstName: "Иван",
        lastName: "Петров",
        email: "ivan@example.com",
      },
    },
    {
      id: "2",
      title: "Проблема с асинхронным кодом",
      content:
        "У меня есть проблема с Promise.all, не понимаю почему не работает как ожидается...",
      status: "APPROVED",
      adminResponse: "Отличный вопрос! Вот подробное объяснение с примерами...",
      isResponseSent: true,
      createdAt: new Date("2024-01-10"),
      user: {
        firstName: "Мария",
        lastName: "Сидорова",
        email: "maria@example.com",
      },
    },
    {
      id: "3",
      title: "Архитектура микросервисов",
      content:
        "Хочу узнать больше о том, как правильно проектировать микросервисы...",
      status: "NEEDS_REVISION",
      adminResponse:
        "Ваш вопрос слишком общий. Пожалуйста, уточните конкретные аспекты...",
      isResponseSent: true,
      createdAt: new Date("2024-01-05"),
      user: {
        firstName: "Алексей",
        lastName: "Козлов",
        email: "alex@example.com",
      },
    },
  ]);

  const filteredSubmissions = computed(() => {
    let filtered = submissions.value;

    if (filters.value?.search) {
      const query = filters.value.search.toLowerCase();
      filtered = filtered.filter(
        (submission) =>
          submission.title.toLowerCase().includes(query) ||
          submission.content.toLowerCase().includes(query) ||
          submission.user.firstName.toLowerCase().includes(query) ||
          submission.user.lastName.toLowerCase().includes(query),
      );
    }

    if (filters.value?.status) {
      filtered = filtered.filter(
        (submission) => submission.status === filters.value?.status,
      );
    }

    if (filters.value?.date) {
      const date = filters.value.date;
      filtered = filtered.filter((submission) => {
        const submissionDate = new Date(submission.createdAt);
        return submissionDate.toDateString() === date.toDateString();
      });
    }

    return filtered;
  });

  const handleFiltersUpdate = (
    newFilters: Partial<AdminSubmissionsCatalogFilters>,
  ) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const handleFiltersReset = () => {
    filters.value = {
      page: 1,
      limit: 10,
    };
  };

  const filtersForComponent = computed(() => ({
    search: filters.value.search,
    status: filters.value.status,
    date: filters.value.date,
  }));

  const handleFiltersChange = (newFilters: SubmissionsFilters) => {
    handleFiltersUpdate({
      ...newFilters,
      page: filters.value.page,
      limit: filters.value.limit,
    });
  };

  const exportSubmissions = () => {
    // TODO: реализовать экспорт заявок
  };

  return {
    loading,
    filters,
    filtersForComponent,
    submissions: filteredSubmissions,
    selectedSubmissions,
    handleFiltersUpdate,
    handleFiltersChange,
    handleFiltersReset,
    exportSubmissions,
  };
}
