<template>
  <div class="admin-tests-catalog">
    <div class="page-header">
      <h1>Настройки тестов</h1>
      <Button
        label="Добавить тест"
        icon="pi pi-plus"
        @click="$emit('create')"
      />
    </div>

    <AdminTestsFilters
      :model-value="{ search: filters.search }"
      @update:model-value="handleFiltersUpdate"
      @reset="handleFiltersReset"
    />

    <AdminTestsTable
      :tests="tests"
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
import { AdminTestsFilters } from "@features/admin-tests-filters";
import { AdminTestsTable } from "@features/admin-tests-table";
import { useAdminTestsCatalog } from "../model/useAdminTestsCatalog";
import type { Test } from "@features/admin-tests-table";

const emit = defineEmits<{
  (event: "create"): void;
  (event: "edit", test: Test): void;
  (event: "delete", test: Test): void;
}>();

const {
  filters,
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
  refresh,
} = useAdminTestsCatalog(emit);

defineExpose({
  tagOptions,
  tagsLoading,
  refresh,
});
</script>

<style scoped src="../style/admin-tests-catalog.css"></style>

