import { ref } from "vue";
import type { User } from "@features/admin-users-table";

export function useAdminUsersPage() {
  const showAddUserModal = ref(false);
  const editingUser = ref<User | null>(null);

  const openCreateModal = () => {
    editingUser.value = null;
    showAddUserModal.value = true;
  };

  const openEditModal = (user: User) => {
    editingUser.value = user;
    showAddUserModal.value = true;
  };

  const closeModal = () => {
    showAddUserModal.value = false;
    editingUser.value = null;
  };

  return {
    showAddUserModal,
    editingUser,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}

