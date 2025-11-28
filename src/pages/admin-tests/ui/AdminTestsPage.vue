<template>
  <div class="admin-tests-page">
    <AdminTestsCatalog
      ref="catalogRef"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <TestModal
      v-model:visible="modalVisible"
      :value="modalForm"
      :tag-options="tagOptions"
      :tags-loading="tagsLoading"
      :saving="formSubmitting"
      @submit="handleModalSubmitWrapper"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { AdminTestsCatalog } from "@widgets/admin-tests-catalog";
import { TestModal } from "@features/test-modal";
import { useAdminTestsPage } from "../model/useAdminTestsPage";
import type { Test } from "@features/tests-table";
import type { TestModalSubmitPayload } from "@features/test-modal";

const catalogRef = ref<InstanceType<typeof AdminTestsCatalog> | null>(null);

const {
  modalVisible,
  formSubmitting,
  modalForm,
  openCreateModal,
  openEditModal,
  closeModal,
  handleModalSubmit,
} = useAdminTestsPage();

const tagOptions = computed(() => {
  return catalogRef.value?.tagOptions || [];
});

const tagsLoading = computed(() => {
  return catalogRef.value?.tagsLoading || false;
});

const handleCreate = () => {
  openCreateModal();
};

const handleEdit = (test: Test) => {
  openEditModal(test);
};

const handleDelete = (test: Test) => {
  // Логика уже обрабатывается в виджете
};

const handleModalSubmitWrapper = async (payload: TestModalSubmitPayload) => {
  if (catalogRef.value) {
    await handleModalSubmit(payload, async () => {
      await catalogRef.value?.refresh();
    });
  }
};
</script>

<style scoped>
.admin-tests-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

