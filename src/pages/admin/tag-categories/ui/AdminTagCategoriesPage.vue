<template>
  <div class="admin-tag-categories-page">
    <AdminTagCategoriesCatalog
      ref="catalogRef"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <AdminTagCategoryModal
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
import { AdminTagCategoriesCatalog } from "@widgets/admin-tag-categories-catalog";
import { AdminTagCategoryModal } from "@features/admin-tag-category-modal";
import { useAdminTagCategoriesPage } from "../model/useAdminTagCategoriesPage";
import type { CategoryTableItem } from "@features/admin-tag-categories-table";

const catalogRef = ref<InstanceType<typeof AdminTagCategoriesCatalog> | null>(null);

const { modal, openEditModal, closeModal, handleModalSave } =
  useAdminTagCategoriesPage();

const handleCreate = (data: { name: string; color: string }) => {
  // Логика уже обрабатывается в виджете
};

const handleEdit = (category: CategoryTableItem) => {
  openEditModal(category);
};

const handleDelete = (category: CategoryTableItem) => {
  // Логика уже обрабатывается в виджете
};

const handleModalSaveWrapper = async (payload: {
  id?: number;
  name: string;
  color: string;
}) => {
  const success = await handleModalSave(payload);
  if (success && catalogRef.value) {
    await catalogRef.value.fetchCategories();
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

