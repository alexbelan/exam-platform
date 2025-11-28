<template>
  <Table
    :data="props.tags"
    :columns="props.columns"
    :loading="props.loading"
    paginator
    lazy
    :first="(props.pagination.page - 1) * props.pagination.limit"
    :rows="props.pagination.limit"
    :totalRecords="props.pagination.total"
    :rowsPerPageOptions="[10, 25, 50]"
    :empty-message="'Теги не найдены'"
    @page="handlePageChange"
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
          @click="$emit('edit', data)"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          v-tooltip.top="'Удалить тег'"
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
import { getTagColor, getTagChipStyle } from "../model/useTagsTable";
import type { TagsTableProps, TagsTableEmits } from "../model/types";

const props = defineProps<TagsTableProps>();
const emit = defineEmits<TagsTableEmits>();

const handlePageChange = (event: PageEvent) => {
  emit("page-change", { page: event.page + 1, rows: event.rows });
};
</script>

<style scoped src="../style/admin-tags-table.css"></style>

