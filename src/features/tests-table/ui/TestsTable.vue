<template>
  <Table
    :data="props.tests"
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
      <div v-if="data.tags?.length" class="setting-tags">
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
      {{ formatDate(value as string, "date") }}
    </template>

    <template #actions="{ data }">
      <div class="action-buttons">
        <Button
          v-tooltip.top="'Редактировать'"
          icon="pi pi-pencil"
          severity="info"
          text
          rounded
          @click="$emit('edit', data)"
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

    <template #empty>
      <div class="empty-state">Нет настроек тестов</div>
    </template>
  </Table>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";
import { Table } from "@shared/ui";
import type { PageEvent } from "@shared/ui/Table";
import { formatDate } from "@shared/utils";
import type { TestsTableProps, TestsTableEmits } from "../model/types";

const props = defineProps<TestsTableProps>();
const emit = defineEmits<TestsTableEmits>();

const handlePageChange = (event: PageEvent) => {
  emit("page-change", { page: event.page + 1, rows: event.rows });
};
</script>

<style scoped src="../style/admin-tests-table.css"></style>
