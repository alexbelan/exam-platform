<template>
  <div class="admin-tags-page">
    <div class="admin-tags-catalog">
      <div class="page-header">
        <h1>Управление тегами</h1>
        <div class="header-actions">
          <Button
            label="Добавить тег"
            icon="pi pi-plus"
            @click="handleCreate"
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

      <TagsFilters
        :model-value="filtersForComponent"
        :categories="categories"
        :categories-loading="categoriesLoading"
        @update:model-value="handleFiltersUpdate"
        @reset="handleFiltersReset"
      />

      <TagsTable
        :tags="tags"
        :pagination="pagination"
        :loading="loading"
        :columns="columns"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />
    </div>

    <TagModal
      :visible="tagModal.visible"
      :tag="tagModal.tag"
      :saving="tagModal.saving"
      :categories="categoryOptions"
      @update:visible="tagModal.visible = $event"
      @save="handleTagModalSaveWrapper"
      @cancel="closeTagModal"
    />
  </div>
</template>

<script setup lang="ts">
import { TagsFilters } from "@features/tags-filters";
import { TagsTable } from "@features/tags-table";
import { TagModal } from "@features/tag-modal";
import { useAdminTagsCatalog } from "../model/useAdminTagsCatalog";
import { useAdminTagsPage } from "../model/useAdminTagsPage";
import type { Tag } from "@features/tags-table";

const emit = defineEmits<{
  (event: "create"): void;
  (event: "edit" | "delete", tag: Tag): void;
}>();

const {
  filtersForComponent,
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
  handleDelete: handleDeleteCatalog,
  refreshData,
} = useAdminTagsCatalog(emit);

const { tagModal, openTagModal, closeTagModal, handleTagModalSave } =
  useAdminTagsPage();

const handleCreate = () => {
  openTagModal(null, categoryOptions.value);
};

const handleEdit = (tag: Tag) => {
  openTagModal(tag, categoryOptions.value);
};

const handleDelete = (tag: Tag) => {
  handleDeleteCatalog(tag);
};

const handleTagModalSaveWrapper = async (payload: {
  id?: number;
  name: string;
  categoryId: number;
}) => {
  const success = await handleTagModalSave(payload);
  if (success) {
    await refreshData();
  }
};
</script>

<style scoped>
.admin-tags-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

<style scoped src="../style/admin-tags-catalog.css"></style>
