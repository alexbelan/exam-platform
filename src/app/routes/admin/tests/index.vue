<template>
  <div class="admin-tests">
    <div class="page-header">
      <h1>Настройки тестов</h1>
      <Button
        label="Добавить тест"
        icon="pi pi-plus"
        @click="openCreateModal"
      />
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Поиск:</label>
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по названию..."
          class="search-input"
        />
      </div>
    </div>

    <Table
      :data="tests"
      :columns="columns"
      :loading="loading"
      paginator
      lazy
      :first="(pagination.page - 1) * pagination.limit"
      :rows="pagination.limit"
      :totalRecords="pagination.total"
      :rowsPerPageOptions="[5, 10, 25]"
      @page="onPageChange"
    >
      <template #column-name="{ data }">
        <div class="setting-name">
          <span class="title">{{ data.name }}</span>
          <small class="meta">ID: {{ data.id }}</small>
          <p v-if="data.description" class="description">
            {{ data.description }}
          </p>
        </div>
      </template>

      <template #column-tags="{ data }">
        <div class="setting-tags" v-if="data.tags?.length">
          <Tag
            v-for="tag in data.tags"
            :key="tag.id"
            :value="tag.name"
            severity="info"
            class="tag-small"
          />
        </div>
        <span v-else class="no-tags">Теги не выбраны</span>
      </template>

      <template #column-createdAt="{ value }">
        {{ formatDate(value as string) }}
      </template>

      <template #actions="{ data }">
        <div class="action-buttons">
          <Button
            icon="pi pi-pencil"
            severity="info"
            text
            rounded
            v-tooltip.top="'Редактировать'"
            @click="openEditModal(data)"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            v-tooltip.top="'Удалить'"
            @click="deleteTest(data)"
          />
        </div>
      </template>

      <template #empty>
        <div class="empty-state">Нет настроек тестов</div>
      </template>
    </Table>

    <AdminTestModal
      v-model:visible="modalVisible"
      :value="modalForm"
      :tag-options="tagOptions"
      :tags-loading="tagsLoading"
      :saving="formSubmitting"
      @submit="handleModalSubmit"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { Table } from "@shared/ui";
import { AdminTestModal } from "@features/admin-test-modal";
import { trpc } from "#shared/lib/trpc";
import type {
  AdminTestFormState,
  AdminTestModalSubmitPayload,
  AdminTestTagOption,
} from "@features/admin-test-modal";
import type { TableColumn, PageEvent } from "@shared/ui/Table";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});

interface Test {
  id: number;
  name: string;
  description: string | null;
  questionCount: number;
  questionIds: number[];
  isPublished: boolean;
  requiresPremium?: boolean;
  createdAt: string;
  updatedAt: string;
  tags: AdminTestTagOption[];
  primaryTag: AdminTestTagOption | null;
}

const toast = useToastClient();

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

const searchQuery = ref("");
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

const modalVisible = ref(false);
const formSubmitting = ref(false);
const modalForm = ref<AdminTestFormState | null>(null);

const tagOptions = ref<AdminTestTagOption[]>([]);
const tagsLoading = ref(false);

// Параметры запроса для кеширования
const queryParams = computed(() => ({
  page: pagination.value.page,
  limit: pagination.value.limit,
  search: searchQuery.value.trim() || undefined,
}));

// Ключ кеша
const cacheKey = computed(
  () => `admin-tests-${JSON.stringify(queryParams.value)}`
);

// Кеширование через useAsyncData
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
        ? test.tags.some((tag: AdminTestTagOption) => tag.id === primaryTag.id)
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
  }
);

// Синхронизируем данные из кеша
const tests = computed(() => testsData.value?.tests ?? []);
watch(
  testsData,
  (newData) => {
    if (newData) {
      pagination.value = newData.pagination;
    }
  },
  { immediate: true }
);

// Обработка ошибок
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

const fetchTests = async () => {
  // Очищаем кеш перед обновлением, чтобы гарантировать свежие данные
  await clearNuxtData(cacheKey.value);
  await refreshTests();
};

const fetchTags = async () => {
  tagsLoading.value = true;
  try {
    const response = await trpc.tags.getList.query({
      page: 1,
      limit: 100, // Загружаем все теги для выбора
    });
    tagOptions.value = response.tags as AdminTestTagOption[];
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

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const createModalDefaults = (): AdminTestFormState => ({
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

const mapTestToForm = (test: Test): AdminTestFormState => ({
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

const openCreateModal = () => {
  modalForm.value = createModalDefaults();
  modalVisible.value = true;
};

const openEditModal = (test: Test) => {
  modalForm.value = mapTestToForm(test);
  modalVisible.value = true;
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

const handleModalSubmit = async (payload: AdminTestModalSubmitPayload) => {
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

    // Очищаем кеш и обновляем данные после мутации
    await clearNuxtData(cacheKey.value);
    await refreshTests();
    modalVisible.value = false;
  } catch (error) {
    console.error("Ошибка при сохранении теста:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось сохранить тест",
    });
  } finally {
    formSubmitting.value = false;
  }
};

const deleteTest = async (test: Test) => {
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

    // Очищаем кеш и обновляем данные после удаления
    await clearNuxtData(cacheKey.value);
    await refreshTests();
  } catch (error) {
    console.error("Ошибка при удалении теста:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось удалить тест",
    });
  }
};

const onPageChange = (event: PageEvent) => {
  pagination.value.page = event.page + 1;
  pagination.value.limit = event.rows;
  // Данные автоматически обновятся через watch [queryParams]
};

watch(
  () => searchQuery.value,
  () => {
    pagination.value.page = 1;
    // Данные автоматически обновятся через watch [queryParams]
  }
);

onMounted(async () => {
  await Promise.all([fetchTests(), fetchTags()]);
});
</script>

<style scoped>
.admin-tests {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 2rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.search-input {
  width: 300px;
}

.setting-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-name .title {
  font-weight: 500;
  color: #2c3e50;
}

.setting-name .meta {
  color: #6b7280;
  font-size: 0.75rem;
}

.setting-name .description {
  margin: 0;
  color: #4b5563;
  font-size: 0.85rem;
}

.setting-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag-small {
  font-size: 0.75rem;
}

.no-tags {
  color: #6b7280;
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}
</style>
