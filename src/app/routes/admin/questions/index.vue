<template>
  <div class="admin-questions">
    <div class="page-header">
      <h1>Управление вопросами</h1>
      <div class="header-actions">
        <Button
          label="Добавить вопрос"
          icon="pi pi-plus"
          @click="navigateTo('/admin/questions/new')"
        />
        <Button
          label="Импорт"
          icon="pi pi-upload"
          severity="secondary"
          @click="importQuestions"
        />
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Поиск:</label>
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по заголовку..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <label>Статус:</label>
        <Dropdown
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Все статусы"
          class="status-dropdown"
        />
      </div>
    </div>

    <Table
      :data="questions"
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
      <!-- Кастомная отрисовка ID -->
      <template #column-id="{ value }">
        <code class="question-id">{{ value }}</code>
      </template>

      <!-- Кастомная отрисовка заголовка с тегами -->
      <template #column-title="{ data }">
        <div class="question-title">
          <NuxtLink :to="`/admin/questions/${data.id}`" class="title-text">
            {{ data.title }}
          </NuxtLink>
          <div class="question-tags" v-if="data.tags && data.tags.length > 0">
            <Tag
              v-for="tag in data.tags"
              :key="tag.id"
              :value="tag.name"
              severity="info"
              class="tag-small"
              :style="getTagStyles(tag)"
            />
          </div>
        </div>
      </template>

      <template #column-isPublished="{ data }">
        <Tag
          :value="data.isPublished ? 'Опубликован' : 'Черновик'"
          :severity="data.isPublished ? 'success' : 'warning'"
        />
      </template>

      <template #column-createdAt="{ value }">
        {{ formatDate(value as string) }}
      </template>

      <template #actions="{ data }">
        <div class="action-buttons">
          <Button
            icon="pi pi-eye"
            severity="info"
            text
            rounded
            v-tooltip.top="'Просмотр и редактирование'"
            @click="viewQuestion(data)"
          />
          <Button
            :icon="data.isPublished ? 'pi pi-eye-slash' : 'pi pi-eye'"
            :severity="data.isPublished ? 'warning' : 'success'"
            text
            rounded
            v-tooltip.top="
              data.isPublished ? 'Снять с публикации' : 'Опубликовать'
            "
            @click="togglePublish(data)"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            v-tooltip.top="'Удалить'"
            @click="deleteQuestion(data)"
          />
        </div>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { useToastClient } from "@shared/hooks/useToastClient";
import { Table } from "@shared/ui";
import type { TableColumn, PageEvent } from "@shared/ui/Table";

// Используем middleware для проверки прав администратора
definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});

// Инициализируем Toast
const toast = useToastClient();

// Типы
interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  category?: Category | null;
}

interface Question {
  id: number;
  title: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

// Конфигурация колонок таблицы
const columns: TableColumn<Question>[] = [
  {
    field: "id",
    header: "ID",
    sortable: true,
    style: "min-width: 200px",
  },
  {
    field: "title",
    header: "Заголовок",
    sortable: true,
  },
  {
    field: "isPublished",
    header: "Статус",
    sortable: true,
  },
  {
    field: "createdAt",
    header: "Дата создания",
    sortable: true,
  },
];

// Реактивные данные
const questions = ref<Question[]>([]);
const loading = ref(false);
const searchQuery = ref("");
const selectedStatus = ref<boolean | null>(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

// Опции для селектов фильтров
const statusOptions = [
  { label: "Опубликован", value: true },
  { label: "Черновик", value: false },
];

const defaultCategoryColor = "#3b82f6";

const normalizeHex = (value: string): string | null => {
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
  const normalized = normalizeHex(hexColor) || defaultCategoryColor;
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

const getTagStyles = (tag: Tag) => {
  const color = normalizeHex(tag.category?.color || "") || defaultCategoryColor;
  return {
    backgroundColor: color,
    borderColor: color,
    color: getContrastColor(color),
  };
};

// Загрузка вопросов
const fetchQuestions = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    });

    if (searchQuery.value) {
      params.append("search", searchQuery.value);
    }
    if (selectedStatus.value !== null) {
      params.append("status", selectedStatus.value.toString());
    }

    const response = await $fetch<{
      questions: Question[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/api/questions?${params}`);
    questions.value = response.questions;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Ошибка при загрузке вопросов:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось загрузить вопросы",
    });
  } finally {
    loading.value = false;
  }
};

// Форматирование даты
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("ru-RU").format(new Date(dateString));
};

// Просмотр вопроса
const viewQuestion = (question: Question) => {
  navigateTo(`/admin/questions/${question.id}`);
};

// Переключение публикации
const togglePublish = async (question: Question) => {
  try {
    await $fetch(`/api/questions/${question.id}`, {
      method: "PUT",
      body: {
        isPublished: !question.isPublished,
      },
    });

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: question.isPublished
        ? "Вопрос снят с публикации"
        : "Вопрос опубликован",
    });

    await fetchQuestions();
  } catch (error) {
    console.error("Ошибка при изменении статуса:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось изменить статус вопроса",
    });
  }
};

// Удаление вопроса
const deleteQuestion = async (question: Question) => {
  if (confirm(`Вы уверены, что хотите удалить вопрос "${question.title}"?`)) {
    try {
      await $fetch(`/api/questions/${question.id}`, {
        method: "DELETE",
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Вопрос удален",
      });

      await fetchQuestions();
    } catch (error) {
      console.error("Ошибка при удалении вопроса:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось удалить вопрос",
      });
    }
  }
};

// Импорт вопросов
const importQuestions = () => {
  console.log("Импорт вопросов");
};

// Обработчики фильтров
watch(
  [searchQuery, selectedStatus],
  () => {
    pagination.value.page = 1; // Сброс на первую страницу при изменении фильтров
    fetchQuestions();
  },
  { deep: true }
);

// Обработчик пагинации
const onPageChange = (event: PageEvent) => {
  pagination.value.page = event.page + 1;
  pagination.value.limit = event.rows;
  fetchQuestions();
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchQuestions();
});
</script>

<style scoped>
.admin-questions {
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

.header-actions {
  display: flex;
  gap: 1rem;
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

.difficulty-dropdown,
.type-dropdown,
.status-dropdown {
  width: 150px;
}

.question-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-text {
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  transition: color 0.2s;
  text-decoration: none;
}

.title-text:hover {
  color: #0d9488;
  text-decoration: underline;
}

.question-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.tag-small {
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.question-id {
  font-size: 0.85rem;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #6b7280;
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
