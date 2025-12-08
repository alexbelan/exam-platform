<template>
  <Table
    :data="props.questions"
    :columns="props.columns"
    :loading="props.loading"
    paginator
    lazy
    :first="(props.pagination.page - 1) * props.pagination.limit"
    :rows="props.pagination.limit"
    :total-records="props.pagination.total"
    :rows-per-page-options="[5, 10, 25]"
    @page="handlePageChange"
  >
    <!-- Кастомная отрисовка ID -->
    <template #column-id="{ value }">
      <code class="question-id">{{ value }}</code>
    </template>

    <!-- Кастомная отрисовка заголовка с тегами -->
    <template #column-title="{ data }">
      <div class="question-title">
        <a href="#" class="title-text" @click.prevent="$emit('view', data)">
          {{ data.title }}
        </a>
        <div v-if="data.tags && data.tags.length > 0" class="question-tags">
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
      {{ formatDate(value as string, "short") }}
    </template>

    <template #actions="{ data }">
      <div class="action-buttons">
        <Button
          v-tooltip.top="'Просмотр и редактирование'"
          icon="pi pi-eye"
          severity="info"
          text
          rounded
          @click="$emit('view', data)"
        />
        <Button
          v-tooltip.top="
            data.isPublished ? 'Снять с публикации' : 'Опубликовать'
          "
          :icon="data.isPublished ? 'pi pi-eye-slash' : 'pi pi-eye'"
          :severity="data.isPublished ? 'warning' : 'success'"
          text
          rounded
          @click="$emit('toggle-publish', data)"
        />
        <Button
          v-tooltip.top="'Удалить'"
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
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
import { getTagStyles } from "../model/useQuestionsTable";
import { formatDate } from "@shared/utils";
import type { QuestionsTableProps, QuestionsTableEmits } from "../model/types";

const props = defineProps<QuestionsTableProps>();
const emit = defineEmits<QuestionsTableEmits>();

const handlePageChange = (event: PageEvent) => {
  emit("page-change", { page: event.page + 1, rows: event.rows });
};
</script>

<style scoped src="../style/admin-questions-table.css"></style>
