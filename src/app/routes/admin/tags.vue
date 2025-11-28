<template>
  <div class="admin-tags">
    <div class="page-header">
      <h1>Управление тегами</h1>
      <div class="header-actions">
        <Button
          label="Добавить тег"
          icon="pi pi-plus"
          @click="openTagModal()"
        />
        <Button
          label="Обновить"
          icon="pi pi-refresh"
          severity="secondary"
          :loading="tagsLoading || categoriesLoading"
          @click="refreshData"
        />
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-group">
          <label>Поиск</label>
          <InputText
            v-model="tagsSearch"
            placeholder="Поиск по названию тега..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <label>Категория</label>
          <Dropdown
            v-model="selectedCategoryFilter"
            :options="categoryFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Все категории"
            class="category-filter"
            :loading="categoriesLoading"
          />
        </div>
      </div>
    </div>

    <Table
      :data="tags"
      :columns="tagColumns"
      :loading="tagsLoading"
      paginator
      lazy
      :first="(pagination.page - 1) * pagination.limit"
      :rows="pagination.limit"
      :totalRecords="pagination.total"
      :rowsPerPageOptions="rowsPerPageOptions"
      @page="onPageChange"
      :empty-message="'Теги не найдены'"
    >
      <template #column-name="{ data }">
        <div class="tag-name-cell">
          <span
            class="color-dot"
            :style="{ backgroundColor: getTagColor(data) }"
          />
          <span>{{ data.name }}</span>
        </div>
      </template>

      <template #column-category.name="{ data }">
        <div class="tag-category-cell">
          <Tag
            v-if="data.category"
            :value="data.category.name"
            class="tag-chip"
            :style="getTagChipStyle(data.category)"
          />
          <span v-else class="text-muted">Без категории</span>
        </div>
      </template>

      <template #actions="{ data }">
        <div class="action-buttons">
          <Button
            icon="pi pi-pencil"
            severity="warning"
            text
            rounded
            v-tooltip.top="'Редактировать тег'"
            @click="openTagModal(data)"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            v-tooltip.top="'Удалить тег'"
            @click="confirmDeleteTag(data)"
          />
        </div>
      </template>
    </Table>

    <AdminTagModal
      :visible="tagModal.visible"
      :tag="tagModal.tag"
      :saving="tagModal.saving"
      :categories="categoryOptions"
      @update:visible="tagModal.visible = $event"
      @save="handleTagModalSave"
      @cancel="handleTagModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Tag from "primevue/tag";
import { useToastClient } from "@shared/hooks/useToastClient";
import { Table } from "@shared/ui";
import { trpc } from "#shared/lib/trpc";
import type { TableColumn, PageEvent } from "@shared/ui/Table";
import { useConfirm } from "primevue/useconfirm";
import { TAG_CATEGORY_DEFAULT_COLOR } from "@features/admin-tag-category-modal/model/useAdminTagCategoryModal";
import type { CategoryEntity } from "@entities/category";
import { AdminTagModal } from "@features/admin-tag-modal";
import type { TagEntity } from "@features/admin-tag-modal";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});

const toast = useToastClient();
const confirm = useConfirm();

type Tag = TagEntity;

const categories = ref<CategoryEntity[]>([]);
const categoriesLoading = ref(false);
const rowsPerPageOptions = [10, 25, 50];
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

const tagsSearch = ref("");
const selectedCategoryFilter = ref<number | null>(null);

// Параметры запроса для кеширования
const queryParams = computed(() => ({
  page: pagination.value.page,
  limit: pagination.value.limit,
  search: tagsSearch.value.trim() || undefined,
  categoryId: selectedCategoryFilter.value !== null ? selectedCategoryFilter.value : undefined,
}));

// Ключ кеша
const cacheKey = computed(
  () => `admin-tags-${JSON.stringify(queryParams.value)}`
);

// Кеширование через useAsyncData
const {
  data: tagsData,
  pending: tagsLoading,
  error: tagsError,
  refresh: refreshTags,
} = useAsyncData(
  cacheKey,
  async () => {
    const response = await trpc.tags.getList.query({
      page: queryParams.value.page,
      limit: queryParams.value.limit,
      search: queryParams.value.search,
      categoryId: queryParams.value.categoryId?.toString(),
    });

    return {
      tags: response.tags as Tag[],
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
const tags = computed(() => tagsData.value?.tags ?? []);
watch(
  tagsData,
  (newData) => {
    if (newData) {
      pagination.value = newData.pagination;
    }
  },
  { immediate: true }
);

// Обработка ошибок
watch(tagsError, (err) => {
  if (err) {
    console.error("Ошибка при загрузке тегов:", err);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(err, "Не удалось загрузить теги"),
    });
  }
});

const tagModal = reactive({
  visible: false,
  saving: false,
  tag: null as Tag | null,
});

const tagColumns: TableColumn<Tag>[] = [
  {
    field: "name",
    header: "Название",
    sortable: true,
  },
  {
    field: "slug",
    header: "Slug",
    sortable: true,
  },
  {
    field: "category.name",
    header: "Категория",
    sortable: true,
  },
];

const categoryOptions = computed<CategoryEntity[]>(() =>
  categories.value.map(({ id, name, slug, color }) => ({
    id,
    name,
    slug,
    color,
  }))
);

const categoryFilterOptions = computed(() => [
  { label: "Все категории", value: null },
  ...categories.value.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);

const normalizeHex = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const hex = value.trim().replace("#", "");
  if (hex.length === 3) {
    const expanded = hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
    return `#${expanded.toLowerCase()}`;
  }
  if (hex.length === 6) {
    return `#${hex.toLowerCase()}`;
  }
  return null;
};

const getContrastColor = (hexColor: string): string => {
  const normalized = normalizeHex(hexColor) || TAG_CATEGORY_DEFAULT_COLOR;
  const hex = normalized.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const luminance =
    0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
    0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
    0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

  return luminance > 0.5 ? "#1f2937" : "#ffffff";
};

const getCategoryColor = (category?: CategoryEntity | null) =>
  normalizeHex(category?.color || "") || TAG_CATEGORY_DEFAULT_COLOR;

const getTagColor = (tag: Tag) =>
  normalizeHex(tag.category?.color || "") || TAG_CATEGORY_DEFAULT_COLOR;

const getTagChipStyle = (category?: CategoryEntity | null) => {
  const color = getCategoryColor(category);
  return {
    backgroundColor: color,
    borderColor: color,
    color: getContrastColor(color),
  };
};

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const response = await trpc.tagCategories.getList.query({
      page: 1,
      limit: 100, // Загружаем все категории
    });
    categories.value = response.categories as CategoryEntity[];
    if (
      selectedCategoryFilter.value !== null &&
      !categories.value.some(
        (category) => category.id === selectedCategoryFilter.value
      )
    ) {
      selectedCategoryFilter.value = null;
    }
  } catch (error) {
    console.error("Ошибка при загрузке категорий:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(error, "Не удалось загрузить категории"),
    });
  } finally {
    categoriesLoading.value = false;
  }
};

// fetchTags больше не нужна - используем refreshTags напрямую
// Очистка кеша происходит только после мутаций

const refreshData = async () => {
  // Очищаем кеш перед обновлением (только при ручном обновлении)
  await clearNuxtData(cacheKey.value);
  await Promise.all([fetchCategories(), refreshTags()]);
};

const openTagModal = (tag?: Tag | null) => {
  tagModal.tag = tag ?? null;
  tagModal.visible = true;
};

const handleTagModalClose = () => {
  tagModal.visible = false;
  tagModal.tag = null;
};

const handleTagModalSave = async ({
  id,
  name,
  categoryId,
}: {
  id?: number;
  name: string;
  categoryId: number;
}) => {
  const payload = {
    name,
    categoryId,
  };
  const isUpdate = Boolean(id);
  tagModal.saving = true;
  try {
    if (isUpdate && id) {
      await trpc.tags.update.mutate({
        id: id.toString(),
        name: payload.name,
        categoryId: payload.categoryId?.toString() || null,
      });
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Тег обновлен",
      });
    } else {
      await trpc.tags.create.mutate({
        name: payload.name,
        categoryId: payload.categoryId?.toString(),
      });
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Тег создан",
      });
    }
    handleTagModalClose();
    // Очищаем кеш и обновляем данные после мутации
    await clearNuxtData(cacheKey.value);
    await refreshTags();
  } catch (error) {
    console.error("Ошибка при обновлении тега:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(error, "Не удалось обновить тег"),
    });
  } finally {
    tagModal.saving = false;
  }
};

const deleteTag = async (tag: Tag) => {
  try {
    await trpc.tags.delete.mutate({ id: tag.id.toString() });

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: `Тег "${tag.name}" удален`,
    });

    // Очищаем кеш и обновляем данные после удаления
    await clearNuxtData(cacheKey.value);
    await refreshTags();
  } catch (error) {
    console.error("Ошибка при удалении тега:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(error, "Не удалось удалить тег"),
    });
  }
};

const confirmDeleteTag = (tag: Tag) => {
  handleTagModalClose();
  confirm.require({
    header: "Удаление тега",
    message: `Удалить тег "${tag.name}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Удалить",
    rejectLabel: "Отмена",
    acceptClass: "p-button-danger",
    accept: () => deleteTag(tag),
  });
};

watch([tagsSearch, selectedCategoryFilter], () => {
  pagination.value.page = 1;
  // Данные автоматически обновятся через watch [queryParams]
});

const onPageChange = (event: PageEvent) => {
  pagination.value.page = event.page + 1;
  pagination.value.limit = event.rows;
  // Данные автоматически обновятся через watch [queryParams]
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.admin-tags {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.category-filter {
  width: 100%;
}

.tag-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.tag-category-cell {
  display: flex;
  align-items: center;
}

.tag-chip {
  border-radius: 9999px;
}

.text-muted {
  color: #9ca3af;
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
    align-items: flex-start;
  }
}
</style>
