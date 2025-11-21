<template>
  <Dialog
    :visible="visible"
    :header="
      editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'
    "
    :modal="true"
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="user-form">
      <div class="form-group">
        <label>Имя:</label>
        <InputText v-model="userForm.firstName" />
      </div>
      <div class="form-group">
        <label>Фамилия:</label>
        <InputText v-model="userForm.lastName" />
      </div>
      <div class="form-group">
        <label>Email:</label>
        <InputText v-model="userForm.email" type="email" />
      </div>
      <div class="form-group">
        <label>Пароль:</label>
        <Password
          v-model="userForm.password"
          :placeholder="
            editingUser
              ? 'Оставьте пустым, чтобы не изменять'
              : 'Введите пароль'
          "
          :feedback="false"
          toggleMask
        />
      </div>
      <div class="form-group">
        <label>Роль:</label>
        <Dropdown v-model="userForm.role" :options="roleOptions" />
      </div>
      <div class="form-group">
        <label>Статус:</label>
        <Dropdown v-model="userForm.isActive" :options="activeOptions" />
      </div>
      <div class="form-group">
        <label>Тип подписки:</label>
        <Dropdown
          v-model="userForm.subscriptionType"
          :options="subscriptionOptions"
        />
      </div>
      <div class="form-group">
        <label>Пожизненный доступ:</label>
        <Checkbox v-model="userForm.isLifetimeAccess" binary />
      </div>
      <div
        v-if="
          userForm.subscriptionType !== 'FREE' && !userForm.isLifetimeAccess
        "
        class="form-group"
      >
        <label>Дата окончания подписки:</label>
        <Calendar v-model="userForm.subscriptionEndsAt" dateFormat="dd.mm.yy" />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" severity="secondary" @click="handleCancel" />
      <Button
        :label="editingUser ? 'Сохранить' : 'Добавить'"
        :loading="loading"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useToastClient } from "@shared/hooks/useToastClient";
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
}

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  subscriptionType: string;
  isLifetimeAccess: boolean;
  subscriptionEndsAt: Date | null;
}

// Props
interface Props {
  visible: boolean;
  editingUser?: User | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "update:visible": [value: boolean];
  "user-saved": [];
}>();

// Реактивные данные
const loading = ref(false);

// Форма пользователя
const userForm = ref<UserForm>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "USER",
  isActive: true,
  subscriptionType: "FREE",
  isLifetimeAccess: false,
  subscriptionEndsAt: null,
});

// Опции для селектов
const roleOptions = [
  { label: "Пользователь", value: "USER" },
  { label: "Администратор", value: "ADMIN" },
];

const activeOptions = [
  { label: "Активен", value: true },
  { label: "Заблокирован", value: false },
];

const subscriptionOptions = [
  { label: "Бесплатный", value: "FREE" },
  { label: "Премиум (месячная)", value: "PREMIUM_MONTHLY" },
  { label: "Премиум (годовая)", value: "PREMIUM_YEARLY" },
  { label: "Пожизненный", value: "LIFETIME" },
];

// Методы
const resetForm = () => {
  userForm.value = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "USER",
    isActive: true,
    subscriptionType: "FREE",
    isLifetimeAccess: false,
    subscriptionEndsAt: null,
  };
};

const populateForm = (user: User) => {
  userForm.value = {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    password: "", // Не показываем существующий пароль
    role: user.role,
    isActive: user.isActive,
    subscriptionType: user.subscriptionType,
    isLifetimeAccess: user.isLifetimeAccess,
    subscriptionEndsAt: user.subscriptionEndsAt
      ? new Date(user.subscriptionEndsAt)
      : null,
  };
};

const handleCancel = () => {
  resetForm();
  emit("update:visible", false);
};

const handleSave = async () => {
  loading.value = true;

  try {
    // Валидация
    if (!userForm.value.email) {
      toast.add({
        severity: "warn",
        summary: "Предупреждение",
        detail: "Email обязателен",
      });
      return;
    }

    if (!props.editingUser && !userForm.value.password) {
      toast.add({
        severity: "warn",
        summary: "Предупреждение",
        detail: "Пароль обязателен для нового пользователя",
      });
      return;
    }

    const userData: any = { ...userForm.value };

    // Убираем пустой пароль при редактировании
    if (props.editingUser && !userData.password) {
      delete userData.password;
    }

    if (props.editingUser) {
      // Обновление существующего пользователя
      await $fetch(`/api/users/${props.editingUser.id}`, {
        method: "PUT",
        body: userData,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Пользователь обновлен",
      });
    } else {
      // Создание нового пользователя
      await $fetch("/api/users", {
        method: "POST",
        body: userData,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Пользователь создан",
      });
    }

    resetForm();
    emit("update:visible", false);
    emit("user-saved");
  } catch (error: any) {
    console.error("Ошибка при сохранении пользователя:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.data?.message || "Не удалось сохранить пользователя",
    });
  } finally {
    loading.value = false;
  }
};

// Наблюдение за изменением редактируемого пользователя
watch(
  () => props.editingUser,
  (newUser) => {
    if (newUser) {
      populateForm(newUser);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Сброс формы при открытии модального окна
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible && !props.editingUser) {
      resetForm();
    }
  }
);
</script>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}
</style>
