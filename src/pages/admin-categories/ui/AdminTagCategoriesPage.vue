<template>
  <div class="admin-tag-categories-page">
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

      <CategoryForm @submit="handleCreate" />

      <CategoriesTable
        :categories="categories"
        :pagination="pagination"
        :loading="loading"
        :columns="columns"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />
    </div>

    <CategoryModal
      :visible="modal.visible"
      :category="modal.category"
      :saving="modal.saving"
      @update:visible="modal.visible = $event"
      @save="handleModalSaveWrapper"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { CategoryForm } from "@features/category-form";
import { CategoriesTable } from "@features/categories-table";
import { CategoryModal } from "@features/category-modal";
import { useAdminTagCategoriesCatalog } from "../model/useAdminTagCategoriesCatalog";
import { useAdminTagCategoriesPage } from "../model/useAdminTagCategoriesPage";
import type { CategoryTableItem } from "@features/categories-table";

const emit = defineEmits<{
  (event: "create", data: { name: string; color: string }): void;
  (event: "edit" | "delete", category: CategoryTableItem): void;
}>();

const {
  categories,
  pagination,
  loading,
  columns,
  handlePageChange,
  handleCreate: handleCreateCatalog,
  handleDelete: handleDeleteCatalog,
  fetchCategories,
} = useAdminTagCategoriesCatalog(emit);

const { modal, openEditModal, closeModal, handleModalSave } =
  useAdminTagCategoriesPage();

const handleCreate = (data: { name: string; color: string }) => {
  handleCreateCatalog(data);
};

const handleEdit = (category: CategoryTableItem) => {
  openEditModal(category);
};

const handleDelete = (category: CategoryTableItem) => {
  handleDeleteCatalog(category);
};

const handleModalSaveWrapper = async (payload: {
  id?: number;
  name: string;
  color: string;
}) => {
  const success = await handleModalSave(payload);
  if (success) {
    await fetchCategories();
  }
};
</script>

<style scoped>
.admin-tag-categories-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

<style scoped src="../style/admin-tag-categories-catalog.css"></style>
