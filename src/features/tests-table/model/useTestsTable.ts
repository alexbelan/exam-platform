import { computed, watch, type Ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { TableColumn, PageEvent } from "@shared/ui/Table";
import type { Test, TestsTableFilters } from "./types";
import type { TestTagOption } from "@features/test-modal";

export function useTestsTable(
  filters: Ref<TestsTableFilters>,
  onPageChange: (event: { page: number; rows: number }) => void,
) {
  const toast = useToastClient();

  const queryParams = computed(() => ({
    page: filters.value.page,
    limit: filters.value.limit,
    search: filters.value.search?.trim() || undefined,
  }));

  const cacheKey = computed(
    () => `admin-tests-${JSON.stringify(queryParams.value)}`,
  );

  const {
    data: testsData,
    pending: loading,
    error,
    refresh: refreshTests,
  } = useAsyncData(
    cacheKey,
    async () => {
      const response = await trpc.tests.getList.query({
        page: queryParams.value.page,
        limit: queryParams.value.limit,
        search: queryParams.value.search,
        isPublished: undefined, // В админке показываем все тесты
      });

      const processedTests = response.tests.map((test: Test) => {
        const primaryTag = test.primaryTag ?? null;
        const hasPrimaryInList = primaryTag
          ? test.tags.some((tag: TestTagOption) => tag.id === primaryTag.id)
          : false;
        const mergedTags =
          primaryTag && !hasPrimaryInList
            ? [primaryTag, ...test.tags]
            : test.tags;

        return {
          ...test,
          primaryTag,
          tags: mergedTags,
        };
      });

      return {
        tests: processedTests,
        pagination: response.pagination,
      };
    },
    {
      immediate: true,
      watch: [queryParams],
      getCachedData: (key, nuxtApp) => {
        const cached = nuxtApp.payload.data[key];
        if (cached) {
          return cached;
        }
        return undefined;
      },
    },
  );

  const tests = computed(() => testsData.value?.tests ?? []);
  const pagination = computed(
    () =>
      testsData.value?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
  );

  watch(error, (err) => {
    if (err) {
      console.error("Ошибка при загрузке тестов:", err);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось загрузить тесты",
      });
    }
  });

  const columns: TableColumn<Test>[] = [
    { field: "name", header: "Название", sortable: true },
    {
      field: "questionCount",
      header: "Количество вопросов",
      sortable: true,
      style: "width: 180px",
    },
    { field: "tags", header: "Теги" },
    {
      field: "createdAt",
      header: "Дата создания",
      sortable: true,
      style: "width: 180px",
    },
  ];

  const handlePageChange = (event: PageEvent) => {
    onPageChange({ page: event.page, rows: event.rows });
  };

  const refresh = async () => {
    await clearNuxtData(cacheKey.value);
    await refreshTests();
  };

  return {
    tests,
    pagination,
    loading,
    columns,
    handlePageChange,
    refresh,
    cacheKey,
  };
}
