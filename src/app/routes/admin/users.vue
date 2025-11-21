<template>
  <div class="admin-users">
    <div class="page-header">
      <h1>Управление пользователями</h1>
      <div class="header-actions">
        <Button
          label="Добавить пользователя"
          icon="pi pi-plus"
          @click="showAddUserModal = true"
        />
        <Button
          label="Экспорт"
          icon="pi pi-download"
          severity="secondary"
          @click="exportUsers"
        />
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Поиск:</label>
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по имени или email..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <label>Роль:</label>
        <Dropdown
          v-model="selectedRole"
          :options="roleOptions"
          placeholder="Все роли"
          class="role-dropdown"
        />
      </div>
      <div class="filter-group">
        <label>Статус:</label>
        <Dropdown
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Все статусы"
          class="status-dropdown"
        />
      </div>
      <div class="filter-group">
        <label>Подписка:</label>
        <Dropdown
          v-model="selectedSubscription"
          :options="subscriptionOptions"
          placeholder="Все подписки"
          class="subscription-dropdown"
        />
      </div>
    </div>

    <div class="users-table">
      <DataTable
        :value="filteredUsers"
        :loading="loading"
        paginator
        :rows="pagination.limit"
        :totalRecords="pagination.total"
        :rowsPerPageOptions="[5, 10, 25]"
        @page="onPageChange"
        class="p-datatable-sm"
      >
        <Column field="firstName" header="Имя" sortable>
          <template #body="{ data }">
            {{ data.firstName }} {{ data.lastName }}
          </template>
        </Column>
        <Column field="email" header="Email" sortable />
        <Column field="role" header="Роль" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.role"
              :severity="data.role === 'ADMIN' ? 'danger' : 'info'"
            />
          </template>
        </Column>
        <Column field="isActive" header="Статус" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.isActive ? 'Активен' : 'Заблокирован'"
              :severity="data.isActive ? 'success' : 'danger'"
            />
          </template>
        </Column>
        <Column field="subscriptionType" header="Подписка" sortable>
          <template #body="{ data }">
            <div class="subscription-info">
              <Tag
                :value="getSubscriptionLabel(data)"
                :severity="getSubscriptionSeverity(data)"
              />
              <div
                v-if="data.subscriptionEndsAt && !data.isLifetimeAccess"
                class="subscription-expiry"
              >
                <small class="text-muted">
                  До: {{ formatDate(data.subscriptionEndsAt) }}
                </small>
              </div>
            </div>
          </template>
        </Column>
        <Column field="createdAt" header="Дата регистрации" sortable>
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>
        <Column header="Действия">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                severity="info"
                text
                rounded
                @click="viewUser(data)"
              />
              <Button
                icon="pi pi-pencil"
                severity="warning"
                text
                rounded
                @click="editUser(data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                @click="deleteUser(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Модальное окно добавления/редактирования пользователя -->
    <UserFormModal
      v-model:visible="showAddUserModal"
      :editing-user="editingUser"
      @user-saved="handleUserSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { useToastClient } from "@shared/hooks/useToastClient";
import { UserFormModal } from "@entities/user";

// Используем middleware для проверки прав администратора
definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});

// Инициализируем Toast
const toast = useToastClient();

// Типы
interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  subscriptionType: string;
  subscriptionEndsAt: string | null;
  isLifetimeAccess: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    submittedQuestions: number;
  };
}

// Реактивные данные
const users = ref<User[]>([]);
const loading = ref(false);
const searchQuery = ref("");
const selectedRole = ref<string | null>(null);
const selectedStatus = ref<boolean | null>(null);
const selectedSubscription = ref<string | null>(null);
const showAddUserModal = ref(false);
const editingUser = ref<User | null>(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

// Опции для селектов фильтров
const statusOptions = [
  { label: "Активен", value: true },
  { label: "Заблокирован", value: false },
];

const subscriptionOptions = [
  { label: "Бесплатный", value: "FREE" },
  { label: "Премиум (месячная)", value: "PREMIUM_MONTHLY" },
  { label: "Премиум (годовая)", value: "PREMIUM_YEARLY" },
  { label: "Пожизненный", value: "LIFETIME" },
];

const roleOptions = [
  { label: "Пользователь", value: "USER" },
  { label: "Администратор", value: "ADMIN" },
];

// Загрузка пользователей
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    });

    if (searchQuery.value) {
      params.append("search", searchQuery.value);
    }
    if (selectedRole.value) {
      params.append("role", selectedRole.value);
    }
    if (selectedStatus.value !== null) {
      params.append("status", selectedStatus.value.toString());
    }
    if (selectedSubscription.value) {
      params.append("subscription", selectedSubscription.value);
    }

    const response = await $fetch(`/api/users?${params}`);
    users.value = response.users;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Ошибка при загрузке пользователей:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось загрузить пользователей",
    });
  } finally {
    loading.value = false;
  }
};

// Фильтрация пользователей (теперь через API)
const filteredUsers = computed(() => users.value);

// Форматирование даты
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("ru-RU").format(new Date(dateString));
};

// Функции для работы с подписками
const getSubscriptionLabel = (user: User): string => {
  if (user.isLifetimeAccess || user.subscriptionType === "LIFETIME") {
    return "Пожизненный";
  }

  switch (user.subscriptionType) {
    case "PREMIUM_MONTHLY":
      return "Премиум (месячная)";
    case "PREMIUM_YEARLY":
      return "Премиум (годовая)";
    case "FREE":
    default:
      return "Бесплатный";
  }
};

const getSubscriptionSeverity = (user: User): string => {
  if (user.isLifetimeAccess || user.subscriptionType === "LIFETIME") {
    return "success";
  }

  if (
    user.subscriptionType === "PREMIUM_MONTHLY" ||
    user.subscriptionType === "PREMIUM_YEARLY"
  ) {
    // Проверяем, не истекла ли подписка
    if (
      user.subscriptionEndsAt &&
      new Date(user.subscriptionEndsAt) > new Date()
    ) {
      return "info";
    } else {
      return "warning"; // Истекшая подписка
    }
  }

  return "secondary"; // Бесплатный
};

// Просмотр пользователя
const viewUser = async (user: User) => {
  try {
    const response = await $fetch(`/api/users/${user.id}`);
    console.log("Детали пользователя:", response.user);
    // Здесь можно открыть модальное окно с детальной информацией
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось получить данные пользователя",
    });
  }
};

// Редактирование пользователя
const editUser = (user: User) => {
  editingUser.value = user;
  showAddUserModal.value = true;
};

// Удаление пользователя
const deleteUser = async (user: User) => {
  if (
    confirm(
      `Вы уверены, что хотите удалить пользователя ${user.firstName} ${user.lastName}?`
    )
  ) {
    try {
      await $fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Пользователь удален",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось удалить пользователя",
      });
    }
  }
};

// Закрытие модального окна
const closeUserModal = () => {
  showAddUserModal.value = false;
  editingUser.value = null;
};

// Обработчик сохранения пользователя
const handleUserSaved = async () => {
  closeUserModal();
  await fetchUsers();
};

// Экспорт пользователей
const exportUsers = () => {
  console.log("Экспорт пользователей");
  // Здесь можно реализовать экспорт в CSV/Excel
};

// Обработчики фильтров
watch(
  [searchQuery, selectedRole, selectedStatus, selectedSubscription],
  () => {
    pagination.value.page = 1; // Сброс на первую страницу при изменении фильтров
    fetchUsers();
  },
  { deep: true }
);

// Обработчик пагинации
const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchUsers();
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 2rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.search-input {
  width: 300px;
}

.role-dropdown,
.status-dropdown,
.subscription-dropdown {
  width: 150px;
}

.users-table {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.subscription-expiry {
  margin-top: 0.25rem;
}

.text-muted {
  color: #6c757d;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}
</style>
