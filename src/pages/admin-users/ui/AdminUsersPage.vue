<template>
  <div class="admin-users-page">
    <div class="admin-users-catalog">
      <div class="page-header">
        <h1>Управление пользователями</h1>
        <div class="header-actions">
          <Button
            label="Добавить пользователя"
            icon="pi pi-plus"
            @click="handleCreate"
          />
          <Button
            label="Экспорт"
            icon="pi pi-download"
            severity="secondary"
            @click="exportUsers"
          />
        </div>
      </div>

      <UsersFilters
        :model-value="{
          search: filters.search,
          role: filters.role,
          status: filters.status,
          subscription: filters.subscription,
        }"
        @update:model-value="handleFiltersUpdate"
        @reset="handleFiltersReset"
      />

      <UsersTable
        :users="users"
        :pagination="pagination"
        :loading="loading"
        :subscription-filter="filters.subscription"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />
    </div>

    <UserFormModal
      v-model:visible="showAddUserModal"
      :editing-user="editingUser"
      @user-saved="handleUserSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { UsersFilters } from "@features/users-filters";
import { UsersTable } from "@features/users-table";
import { UserFormModal } from "@entities/user";
import { useAdminUsersCatalog } from "../model/useAdminUsersCatalog";
import { useAdminUsersPage } from "../model/useAdminUsersPage";
import type { User } from "@features/users-table";

const emit = defineEmits<{
  (event: "create"): void;
  (event: "view" | "edit" | "delete", user: User): void;
}>();

const {
  filters,
  users,
  pagination,
  loading,
  handleView: handleViewCatalog,
  handleDelete: handleDeleteCatalog,
  handleFiltersUpdate,
  handleFiltersReset,
  exportUsers,
  handlePageChange,
  refresh,
} = useAdminUsersCatalog(emit);

const {
  showAddUserModal,
  editingUser,
  openCreateModal,
  openEditModal,
  closeModal,
} = useAdminUsersPage();

const handleCreate = () => {
  openCreateModal();
};

const handleView = (user: User) => {
  handleViewCatalog(user);
};

const handleEdit = (user: User) => {
  openEditModal(user);
};

const handleDelete = (user: User) => {
  handleDeleteCatalog(user);
};

const handleUserSaved = async () => {
  closeModal();
  await refresh();
};
</script>

<style scoped>
.admin-users-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

<style scoped src="../style/admin-users-catalog.css"></style>
