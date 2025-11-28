<template>
  <div class="admin-tag-categories">
    <div class="page-header">
      <h1>Категории тегов</h1>
      <div class="header-actions">
        <Button
          label="Обновить"
          icon="pi pi-refresh"
          severity="secondary"
          :loading="loading"
          @click="fetchCategories"
        />
      </div>
    </div>

    <div class="management-card">
      <div class="card-header">
        <h2>Добавить категорию</h2>
        <span class="card-hint">
          Выбирайте цвет категории через встроенный Color Picker, чтобы теги в
          интерфейсе отображались единообразно.
        </span>
      </div>

      <form class="category-form" @submit.prevent="handleCreateCategory">
        <div class="form-row">
          <FormInput
            v-model="newCategory.name"
            label="Название категории"
            placeholder="Например, Frontend"
            required
          />
          <ColorPicker
            v-model="newCategory.color"
            label="Цвет"
            with-hex-input
            :withColorsHistory="5"
          />
        </div>
        <div class="form-actions">
          <Button
            type="submit"
            label="Добавить категорию"
            icon="pi pi-plus"
            :loading="creating"
          />
        </div>
      </form>
    </div>

    <Table
      :data="categories"
      :columns="columns"
      :loading="loading"
      paginator
      lazy
      :first="(pagination.page - 1) * pagination.limit"
      :rows="pagination.limit"
      :totalRecords="pagination.total"
      :rowsPerPageOptions="rowsPerPageOptions"
      @page="onPageChange"
      :empty-message="'Категории не найдены'"
    >
      <template #column-name="{ data }">
        <div class="category-name-cell">
          <span
            class="color-dot"
            :style="{ backgroundColor: getCategoryColor(data) }"
          />
          <div class="category-name">{{ data.name }}</div>
        </div>
      </template>

      <template #column-tagCount="{ value }">
        <Tag
          :value="`${value}`"
          icon="pi pi-tags"
          severity="info"
          class="tag-count"
        />
      </template>

      <template #actions="{ data }">
        <div class="action-buttons">
          <Button
            icon="pi pi-pencil"
            severity="warning"
            text
            rounded
            v-tooltip.top="'Редактировать категорию'"
            @click="openEditModal(data)"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            v-tooltip.top="'Удалить категорию'"
            @click="confirmDeleteCategory(data)"
          />
        </div>
      </template>
    </Table>

    <AdminTagCategoryModal
      :visible="modal.visible"
      :category="modal.category"
      :saving="modal.saving"
      @update:visible="modal.visible = $event"
      @save="handleModalSave"
      @cancel="handleModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import Tag from "primevue/tag";
import { useToastClient } from "@shared/hooks/useToastClient";
import { FormInput, Table, ColorPicker } from "@shared/ui";
import { trpc } from "#shared/lib/trpc";
import type { TableColumn, PageEvent } from "@shared/ui/Table";
import { useConfirm } from "primevue/useconfirm";
import { AdminTagCategoryModal } from "@features/admin-tag-category-modal";
import { TAG_CATEGORY_DEFAULT_COLOR } from "@features/admin-tag-category-modal/model/useAdminTagCategoryModal";
import type { CategoryEntity } from "@entities/category";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});

const toast = useToastClient();
const confirm = useConfirm();

type CategoryTableItem = CategoryEntity & { tagCount: number };

const creating = ref(false);
const rowsPerPageOptions = [10, 25, 50];
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

// Параметры запроса для кеширования
const queryParams = computed(() => ({
  page: pagination.value.page,
  limit: pagination.value.limit,
}));

// Ключ кеша
const cacheKey = computed(
  () => `admin-tag-categories-${JSON.stringify(queryParams.value)}`
);

// Кеширование через useAsyncData
const {
  data: categoriesData,
  pending: loading,
  error,
  refresh: refreshCategories,
} = useAsyncData(
  cacheKey,
  async () => {
    const response = await trpc.tagCategories.getList.query({
      page: queryParams.value.page,
      limit: queryParams.value.limit,
    });

    const processedCategories = response.categories.map(
      (category: CategoryEntity & { _count?: { tags: number } }) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        color: category.color,
        tagCount: (category as any)._count?.tags ?? 0,
      })
    );

    return {
      categories: processedCategories as CategoryTableItem[],
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
const categories = computed(() => categoriesData.value?.categories ?? []);
watch(
  categoriesData,
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
    console.error("Ошибка при загрузке категорий:", err);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(err, "Не удалось загрузить категории"),
    });
  }
});

const newCategory = reactive({
  name: "",
  color: TAG_CATEGORY_DEFAULT_COLOR,
});

const modal = reactive({
  visible: false,
  saving: false,
  category: null as CategoryTableItem | null,
});

const columns: TableColumn<CategoryTableItem>[] = [
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
    field: "tagCount",
    header: "Количество тегов",
    sortable: true,
    style: "width: 160px; text-align: center;",
  },
];

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

const getCategoryColor = (category: CategoryEntity | null) =>
  normalizeHex(category?.color) || TAG_CATEGORY_DEFAULT_COLOR;

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

const fetchCategories = async () => {
  // Очищаем кеш перед обновлением, чтобы гарантировать свежие данные
  await clearNuxtData(cacheKey.value);
  await refreshCategories();
};

const handleCreateCategory = async () => {
  if (!newCategory.name.trim()) {
    toast.add({
      severity: "warn",
      summary: "Предупреждение",
      detail: "Введите название категории",
    });
    return;
  }

  creating.value = true;
  try {
    await trpc.tagCategories.create.mutate({
        name: newCategory.name.trim(),
        color: normalizeHex(newCategory.color) || TAG_CATEGORY_DEFAULT_COLOR,
    });

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Категория создана",
    });

    newCategory.name = "";
    newCategory.color = TAG_CATEGORY_DEFAULT_COLOR;

    await fetchCategories();
  } catch (error) {
    console.error("Ошибка при создании категории:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(error, "Не удалось создать категорию"),
    });
  } finally {
    creating.value = false;
  }
};

const openEditModal = (category: CategoryTableItem) => {
  modal.category = category;
  modal.visible = true;
};

const handleModalClose = () => {
  modal.visible = false;
  modal.category = null;
};

const handleModalSave = async ({
  id,
  name,
  color,
}: {
  id?: number;
  name: string;
  color: string;
}) => {
  if (!id) return;

  modal.saving = true;
  try {
    await trpc.tagCategories.update.mutate({
      id: id.toString(),
        name,
        color,
    });

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Категория обновлена",
    });

    handleModalClose();
    await fetchCategories();
  } catch (error) {
    console.error("Ошибка при обновлении категории:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(error, "Не удалось обновить категорию"),
    });
  } finally {
    modal.saving = false;
  }
};

const deleteCategory = async (category: CategoryTableItem) => {
  try {
    await trpc.tagCategories.delete.mutate({ id: category.id.toString() });

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: `Категория "${category.name}" удалена`,
    });

    await fetchCategories();
  } catch (error) {
    console.error("Ошибка при удалении категории:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: extractErrorMessage(
        error,
        "Не удалось удалить категорию. Убедитесь, что в ней нет тегов."
      ),
    });
  }
};

const confirmDeleteCategory = (category: CategoryTableItem) => {
  handleModalClose();
  confirm.require({
    header: "Удаление категории",
    message: `Удалить категорию "${category.name}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Удалить",
    rejectLabel: "Отмена",
    acceptClass: "p-button-danger",
    accept: () => deleteCategory(category),
  });
};

const onPageChange = (event: PageEvent) => {
  pagination.value.page = event.page + 1;
  pagination.value.limit = event.rows;
  // Данные автоматически обновятся через watch [queryParams]
};
</script>

<style scoped>
.admin-tag-categories {
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

.management-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.card-hint {
  color: #6b7280;
  font-size: 0.9rem;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.color-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-field label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.color-picker-inline {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  background: #ffffff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.category-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-name {
  font-weight: 500;
  color: #1f2937;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.tag-count {
  width: 100%;
  justify-content: center;
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

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
