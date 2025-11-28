<template>
  <Table
    :data="props.questions"
    :columns="props.columns"
    :loading="props.loading"
    paginator
    lazy
    :first="(props.pagination.page - 1) * props.pagination.limit"
    :rows="props.pagination.limit"
    :totalRecords="props.pagination.total"
    :rowsPerPageOptions="[5, 10, 25]"
    @page="handlePageChange"
  >
    <!-- Кастомная отрисовка ID -->
    <template #column-id="{ value }">
      <code class="question-id">{{ value }}</code>
    </template>

    <!-- Кастомная отрисовка заголовка с тегами -->
    <template #column-title="{ data }">
      <div class="question-title">
        <a
          href="#"
          class="title-text"
          @click.prevent="$emit('view', data)"
        >
          {{ data.title }}
        </a>
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
          @click="$emit('view', data)"
        />
        <Button
          :icon="data.isPublished ? 'pi pi-eye-slash' : 'pi pi-eye'"
          :severity="data.isPublished ? 'warning' : 'success'"
          text
          rounded
          v-tooltip.top="
            data.isPublished ? 'Снять с публикации' : 'Опубликовать'
          "
          @click="$emit('toggle-publish', data)"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          v-tooltip.top="'Удалить'"
          @click="$emit('delete', data)"
        />
      </div>
    </template>
  </Table>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";
import { Table } from "@shared/ui";
import type { PageEvent } from "@shared/ui/Table";
import { getTagStyles, formatDate } from "../model/useQuestionsTable";
import type { QuestionsTableProps, QuestionsTableEmits } from "../model/types";

const props = defineProps<QuestionsTableProps>();
const emit = defineEmits<QuestionsTableEmits>();

const handlePageChange = (event: PageEvent) => {
  emit("page-change", { page: event.page + 1, rows: event.rows });
};
</script>

<style scoped src="../style/admin-questions-table.css"></style>

