import { computed, ref, onMounted } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useTestsTable } from "@features/tests-table/model/useTestsTable";
import type { AdminTestsCatalogFilters } from "./types";
import type { Test, TestsTableFilters } from "@features/tests-table";
import type {
  TestTagOption,
  TestFormState,
  TestModalSubmitPayload,
} from "@features/test-modal";
import type { PageEvent } from "@shared/ui/Table";

export function useAdminTests(emit: {
  (event: "create"): void;
  (event: "edit" | "delete", test: Test): void;
}) {
  const toast = useToastClient();

  // Catalog state
  const filters = ref<AdminTestsCatalogFilters>({
    page: 1,
    limit: 10,
    search: undefined,
  } as AdminTestsCatalogFilters);

  const tagOptions = ref<TestTagOption[]>([]);
  const tagsLoading = ref(false);

  const tableFilters = computed<TestsTableFilters>(() => {
    const f = filters.value;
    return {
      search: ("search" in f ? f.search : undefined) as string | undefined,
      page: f.page,
      limit: f.limit,
    };
  });

  const {
    tests,
    pagination,
    loading,
    columns,
    handlePageChange: handleTablePageChange,
    refresh,
    cacheKey,
  } = useTestsTable(tableFilters, (event: { page: number; rows: number }) => {
    filters.value.page = event.page + 1;
    filters.value.limit = event.rows;
  });

  // Modal state
  const modalVisible = ref(false);
  const formSubmitting = ref(false);
  const modalForm = ref<TestFormState | null>(null);

  const fetchTags = async () => {
    tagsLoading.value = true;
    try {
      const response = await trpc.tags.getList.query({
        page: 1,
        limit: 100,
      });
      tagOptions.value = response.tags as TestTagOption[];
    } catch (error) {
      console.error("Ошибка при загрузке тегов:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось загрузить теги",
      });
    } finally {
      tagsLoading.value = false;
    }
  };

  const createModalDefaults = (): TestFormState => ({
    id: null,
    name: "",
    description: "",
    questionCount: 10,
    questionIdsRaw: "",
    tags: [],
    primaryTag: null,
    isPublished: false,
    requiresPremium: false,
  });

  const mapTestToForm = (test: Test): TestFormState => ({
    id: test.id,
    name: test.name,
    description: test.description ?? "",
    questionCount: test.questionCount,
    questionIdsRaw: Array.isArray(test.questionIds)
      ? test.questionIds.join(", ")
      : "",
    tags: test.tags ? [...test.tags] : [],
    primaryTag: test.primaryTag ?? null,
    isPublished: Boolean(test.isPublished),
    requiresPremium: Boolean(test.requiresPremium ?? false),
  });

  const handleCreate = () => {
    modalForm.value = createModalDefaults();
    modalVisible.value = true;
    emit("create");
  };

  const handleEdit = (test: Test) => {
    modalForm.value = mapTestToForm(test);
    modalVisible.value = true;
    emit("edit", test);
  };

  const handleDelete = async (test: Test) => {
    if (!confirm(`Вы уверены, что хотите удалить тест "${test.name}"?`)) {
      return;
    }

    try {
      await trpc.tests.delete.mutate({ id: test.id });

      toast.add({
        severity: "success",
        summary: "Удалено",
        detail: "Тест удалён",
      });

      await clearNuxtData(cacheKey.value);
      await refresh();

      emit("delete", test);
    } catch (error) {
      console.error("Ошибка при удалении теста:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось удалить тест",
      });
    }
  };

  const closeModal = () => {
    modalVisible.value = false;
    modalForm.value = null;
  };

  const handleModalSubmit = async (payload: TestModalSubmitPayload) => {
    formSubmitting.value = true;

    try {
      const body = {
        name: payload.name,
        description: payload.description,
        questionCount: payload.questionCount,
        questionIds: payload.questionIds,
        tags: payload.tagIds,
        primaryTag: payload.primaryTagId,
        isPublished: payload.isPublished,
        requiresPremium: payload.requiresPremium,
      };

      if (payload.id) {
        await trpc.tests.update.mutate({
          id: payload.id,
          ...body,
        });
        toast.add({
          severity: "success",
          summary: "Сохранено",
          detail: "Тест обновлён",
        });
      } else {
        await trpc.tests.create.mutate(body);
        toast.add({
          severity: "success",
          summary: "Создано",
          detail: "Новый тест добавлен",
        });
      }

      closeModal();
      await refresh();
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении теста:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось сохранить тест",
      });
      return false;
    } finally {
      formSubmitting.value = false;
    }
  };

  const handleFiltersUpdate = (newFilters: { search?: string }) => {
    filters.value = {
      ...filters.value,
      search: newFilters.search,
    } as AdminTestsCatalogFilters;
    filters.value.page = 1;
  };

  const handleFiltersReset = () => {
    filters.value = {
      page: 1,
      limit: filters.value.limit,
    };
  };

  const handlePageChange = (event: { page: number; rows: number }) => {
    const pageEvent: PageEvent = {
      page: event.page - 1,
      first: (event.page - 1) * event.rows,
      rows: event.rows,
      pageCount: Math.ceil(pagination.value.total / event.rows),
    };
    handleTablePageChange(pageEvent);
  };

  const filtersModel = computed(() => {
    const f = filters.value;
    return {
      search: ("search" in f ? f.search : undefined) as string | undefined,
    };
  });

  onMounted(async () => {
    await fetchTags();
  });

  return {
    // Catalog
    filters,
    filtersModel,
    tests,
    pagination,
    loading,
    columns,
    tagOptions,
    tagsLoading,
    handlePageChange,
    handleFiltersUpdate,
    handleFiltersReset,
    handleDelete,
    refresh,
    // Modal
    modalVisible,
    formSubmitting,
    modalForm,
    handleCreate,
    handleEdit,
    closeModal,
    handleModalSubmit,
  };
}
