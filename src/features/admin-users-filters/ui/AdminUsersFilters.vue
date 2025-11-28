<template>
  <div class="admin-users-filters">
    <div class="filter-group">
      <label>Поиск:</label>
      <InputText
        :model-value="search"
        @update:model-value="search = $event"
        placeholder="Поиск по имени или email..."
        class="search-input"
      />
    </div>
    <div class="filter-group">
      <label>Роль:</label>
      <Dropdown
        :model-value="role"
        @update:model-value="role = $event"
        :options="roleOptions"
        placeholder="Все роли"
        class="role-dropdown"
      />
    </div>
    <div class="filter-group">
      <label>Статус:</label>
      <Dropdown
        :model-value="status"
        @update:model-value="status = $event"
        :options="statusOptions"
        placeholder="Все статусы"
        class="status-dropdown"
      />
    </div>
    <div class="filter-group">
      <label>Подписка:</label>
      <Dropdown
        :model-value="subscription"
        @update:model-value="subscription = $event"
        :options="subscriptionOptions"
        placeholder="Все подписки"
        class="subscription-dropdown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import { useAdminUsersFilters } from "../model/useAdminUsersFilters";
import type { AdminUsersFiltersProps, AdminUsersFiltersEmits } from "../model/types";

const props = defineProps<AdminUsersFiltersProps>();
const emit = defineEmits<AdminUsersFiltersEmits>();

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const {
  search,
  role,
  status,
  subscription,
  statusOptions,
  subscriptionOptions,
  roleOptions,
} = useAdminUsersFilters(filters);
</script>

<style scoped src="../style/admin-users-filters.css"></style>

