<template>
  <div class="admin-tests-page">
    <div class="admin-tests-catalog">
      <div class="page-header">
        <h1>Настройки тестов</h1>
        <Button label="Добавить тест" icon="pi pi-plus" @click="handleCreate" />
      </div>

      <TestsFilters
        :model-value="filtersModel"
        @update:model-value="handleFiltersUpdate"
        @reset="handleFiltersReset"
      />

      <TestsTable
        :tests="tests"
        :pagination="pagination"
        :loading="loading"
        :columns="columns"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />
    </div>

    <TestModal
      v-model:visible="modalVisible"
      :value="modalForm"
      :tag-options="tagOptions"
      :tags-loading="tagsLoading"
      :saving="formSubmitting"
      @submit="handleModalSubmit"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { TestsFilters } from "@features/tests-filters";
import { TestsTable } from "@features/tests-table";
import { TestModal } from "@features/test-modal";
import { useAdminTests } from "../model/useAdminTests";
import type { Test } from "@features/tests-table";

const emit = defineEmits<{
  (event: "create"): void;
  (event: "edit" | "delete", test: Test): void;
}>();

const {
  filtersModel,
  tests,
  pagination,
  loading,
  columns,
  tagOptions,
  tagsLoading,
  handlePageChange,
  handleFiltersUpdate,
  handleFiltersReset,
  handleDelete,
  modalVisible,
  formSubmitting,
  modalForm,
  handleCreate,
  handleEdit,
  closeModal,
  handleModalSubmit,
} = useAdminTests(emit);
</script>

<style scoped src="../style/admin-tests-catalog.css"></style>
