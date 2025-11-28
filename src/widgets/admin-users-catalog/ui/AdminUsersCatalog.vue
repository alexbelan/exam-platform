<template>
  <div class="admin-users-catalog">
    <div class="page-header">
      <h1>Управление пользователями</h1>
      <div class="header-actions">
        <Button
          label="Добавить пользователя"
          icon="pi pi-plus"
          @click="$emit('create')"
        />
        <Button
          label="Экспорт"
          icon="pi pi-download"
          severity="secondary"
          @click="exportUsers"
        />
      </div>
    </div>

    <AdminUsersFilters
      :model-value="{
        search: filters.search,
        role: filters.role,
        status: filters.status,
        subscription: filters.subscription,
      }"
      @update:model-value="handleFiltersUpdate"
      @reset="handleFiltersReset"
    />

    <AdminUsersTable
      :users="users"
      :pagination="pagination"
      :loading="loading"
      :subscription-filter="filters.subscription"
      @view="handleView"
      @edit="$emit('edit', $event)"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { AdminUsersFilters } from "@features/admin-users-filters";
import { AdminUsersTable } from "@features/admin-users-table";
import { useAdminUsersCatalog } from "../model/useAdminUsersCatalog";
import type { User } from "@features/admin-users-table";

const emit = defineEmits<{
  (event: "create"): void;
  (event: "view", user: User): void;
  (event: "edit", user: User): void;
  (event: "delete", user: User): void;
}>();

const {
  filters,
  users,
  pagination,
  loading,
  handleView,
  handleDelete,
  handleFiltersUpdate,
  handleFiltersReset,
  exportUsers,
  handlePageChange,
  refresh,
} = useAdminUsersCatalog(emit);

defineExpose({
  refresh,
});
</script>

<style scoped src="../style/admin-users-catalog.css"></style>

