<template>
  <div class="admin-tag-categories-catalog">
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

    <AdminTagCategoriesCreateForm @submit="handleCreate" />

    <AdminTagCategoriesTable
      :categories="categories"
      :pagination="pagination"
      :loading="loading"
      :columns="columns"
      @edit="$emit('edit', $event)"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { AdminTagCategoriesCreateForm } from "@features/admin-tag-categories-create-form";
import { AdminTagCategoriesTable } from "@features/admin-tag-categories-table";
import { useAdminTagCategoriesCatalog } from "../model/useAdminTagCategoriesCatalog";
import type { CategoryTableItem } from "@features/admin-tag-categories-table";

const emit = defineEmits<{
  (event: "create", data: { name: string; color: string }): void;
  (event: "edit", category: CategoryTableItem): void;
  (event: "delete", category: CategoryTableItem): void;
}>();

const {
  categories,
  pagination,
  loading,
  columns,
  handlePageChange,
  handleCreate,
  handleDelete,
  fetchCategories,
} = useAdminTagCategoriesCatalog(emit);

defineExpose({
  fetchCategories,
});
</script>

<style scoped src="../style/admin-tag-categories-catalog.css"></style>

