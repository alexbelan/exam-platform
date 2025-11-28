<template>
  <div class="admin-users-page">
    <AdminUsersCatalog
      ref="catalogRef"
      @create="handleCreate"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <UserFormModal
      v-model:visible="showAddUserModal"
      :editing-user="editingUser"
      @user-saved="handleUserSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { AdminUsersCatalog } from "@widgets/admin-users-catalog";
import { UserFormModal } from "@entities/user";
import { useAdminUsersPage } from "../model/useAdminUsersPage";
import type { User } from "@features/users-table";

const catalogRef = ref<InstanceType<typeof AdminUsersCatalog> | null>(null);

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
  // Логика уже обрабатывается в виджете
};

const handleEdit = (user: User) => {
  openEditModal(user);
};

const handleDelete = (user: User) => {
  // Логика уже обрабатывается в виджете
};

const handleUserSaved = async () => {
  closeModal();
  if (catalogRef.value) {
    await catalogRef.value.refresh();
  }
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

