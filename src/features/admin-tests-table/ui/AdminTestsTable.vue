<template>
  <Table
    :data="props.tests"
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
          @click="$emit('edit', data)"
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

    <template #empty>
      <div class="empty-state">Нет настроек тестов</div>
    </template>
  </Table>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";
import { Table } from "@shared/ui";
import type { PageEvent } from "@shared/ui/Table";
import { formatDate } from "../model/useAdminTestsTable";
import type { AdminTestsTableProps, AdminTestsTableEmits } from "../model/types";

const props = defineProps<AdminTestsTableProps>();
const emit = defineEmits<AdminTestsTableEmits>();

const handlePageChange = (event: PageEvent) => {
  emit("page-change", { page: event.page + 1, rows: event.rows });
};
</script>

<style scoped src="../style/admin-tests-table.css"></style>

