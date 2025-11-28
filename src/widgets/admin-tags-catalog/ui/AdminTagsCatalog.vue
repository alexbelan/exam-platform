<template>
  <div class="admin-tags-catalog">
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
          :loading="loading"
          @click="refreshData"
        />
      </div>
    </div>

    <AdminTagsFilters
      :model-value="{ search: filters.search, categoryId: filters.categoryId }"
      :categories="categories"
      :categories-loading="categoriesLoading"
      @update:model-value="handleFiltersUpdate"
      @reset="handleFiltersReset"
    />

    <AdminTagsTable
      :tags="tags"
      :pagination="pagination"
      :loading="loading"
      :columns="columns"
      @edit="openTagModal"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { AdminTagsFilters } from "@features/admin-tags-filters";
import { AdminTagsTable } from "@features/admin-tags-table";
import { useAdminTagsCatalog } from "../model/useAdminTagsCatalog";
import type { Tag } from "@features/admin-tags-table";

const emit = defineEmits<{
  (event: "create"): void;
  (event: "edit", tag: Tag): void;
  (event: "delete", tag: Tag): void;
}>();

const {
  filters,
  tags,
  pagination,
  loading,
  columns,
  categories,
  categoriesLoading,
  categoryOptions,
  handlePageChange,
  handleFiltersUpdate,
  handleFiltersReset,
  openTagModal,
  handleDelete,
  refreshData,
} = useAdminTagsCatalog(emit);

defineExpose({
  categoryOptions,
  refreshData,
});
</script>

<style scoped src="../style/admin-tags-catalog.css"></style>

