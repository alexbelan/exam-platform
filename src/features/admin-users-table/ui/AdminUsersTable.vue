<template>
  <div class="users-table">
    <DataTable
      :value="filteredUsers"
      :loading="props.loading"
      paginator
      :rows="props.pagination.limit"
      :totalRecords="props.pagination.total"
      :rowsPerPageOptions="[5, 10, 25]"
      @page="handlePageChange"
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
              @click="$emit('view', data)"
            />
            <Button
              icon="pi pi-pencil"
              severity="warning"
              text
              rounded
              @click="$emit('edit', data)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="$emit('delete', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import { computed } from "vue";
import { formatDate, getSubscriptionLabel, getSubscriptionSeverity } from "../model/useAdminUsersTable";
import type { AdminUsersTableProps, AdminUsersTableEmits, User } from "../model/types";

const props = defineProps<AdminUsersTableProps>();
const emit = defineEmits<AdminUsersTableEmits>();

const filteredUsers = computed(() => {
  let result = props.users;
  if (props.subscriptionFilter) {
    result = result.filter(
      (user) => user.subscriptionType === props.subscriptionFilter
    );
  }
  return result;
});

const handlePageChange = (event: any) => {
  emit("page-change", { page: event.page + 1, rows: event.rows });
};
</script>

<style scoped src="../style/admin-users-table.css"></style>

