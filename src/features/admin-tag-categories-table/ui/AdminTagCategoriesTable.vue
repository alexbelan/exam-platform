<template>
  <Table
    :data="props.categories"
    :columns="props.columns"
    :loading="props.loading"
    paginator
    lazy
    :first="(props.pagination.page - 1) * props.pagination.limit"
    :rows="props.pagination.limit"
    :totalRecords="props.pagination.total"
    :rowsPerPageOptions="[10, 25, 50]"
    :empty-message="'Категории не найдены'"
    @page="handlePageChange"
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
          @click="$emit('edit', data)"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          v-tooltip.top="'Удалить категорию'"
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
import { getCategoryColor } from "../model/useAdminTagCategoriesTable";
import type { AdminTagCategoriesTableProps, AdminTagCategoriesTableEmits } from "../model/types";

const props = defineProps<AdminTagCategoriesTableProps>();
const emit = defineEmits<AdminTagCategoriesTableEmits>();

const handlePageChange = (event: PageEvent) => {
  emit("page-change", { page: event.page + 1, rows: event.rows });
};
</script>

<style scoped src="../style/admin-tag-categories-table.css"></style>

