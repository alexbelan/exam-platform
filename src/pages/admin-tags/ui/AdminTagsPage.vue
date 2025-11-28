<template>
  <div class="admin-tags-page">
    <AdminTagsCatalog
      ref="catalogRef"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleDelete"
    />

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
import { ref, computed } from "vue";
import { AdminTagsCatalog } from "@widgets/admin-tags-catalog";
import { TagModal } from "@features/tag-modal";
import { useAdminTagsPage } from "../model/useAdminTagsPage";
import type { Tag } from "@features/tags-table";

const catalogRef = ref<InstanceType<typeof AdminTagsCatalog> | null>(null);

const { tagModal, openTagModal, closeTagModal, handleTagModalSave } =
  useAdminTagsPage();

const categoryOptions = computed(() => {
  // Получаем категории из виджета через ref
  return catalogRef.value?.categoryOptions || [];
});

const handleCreate = () => {
  openTagModal(null, categoryOptions.value);
};

const handleEdit = (tag: Tag) => {
  openTagModal(tag, categoryOptions.value);
};

const handleDelete = (tag: Tag) => {
  // Логика уже обрабатывается в виджете
};

// Обработчик успешного сохранения - обновляем данные в каталоге
const handleTagModalSaveWrapper = async (payload: {
  id?: number;
  name: string;
  categoryId: number;
}) => {
  const success = await handleTagModalSave(payload);
  if (success && catalogRef.value) {
    await catalogRef.value.refreshData();
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

