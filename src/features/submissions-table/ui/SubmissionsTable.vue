<template>
  <div class="submissions-table">
    <DataTable
      :value="props.submissions"
      :loading="props.loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 25]"
      class="p-datatable-sm"
      selectionMode="multiple"
      v-model:selection="selectedSubmissions"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="title" header="Заголовок" sortable>
        <template #body="{ data }">
          <div class="submission-title">
            {{ data.title }}
            <div class="submission-meta">
              <span class="user-info"
                >{{ data.user.firstName }} {{ data.user.lastName }}</span
              >
              <span class="email">{{ data.user.email }}</span>
            </div>
          </div>
        </template>
      </Column>
      <Column field="content" header="Содержание">
        <template #body="{ data }">
          <div class="submission-content">
            {{ truncateText(data.content, 100) }}
          </div>
        </template>
      </Column>
      <Column field="status" header="Статус" sortable>
        <template #body="{ data }">
          <Tag
            :value="getStatusLabel(data.status)"
            :severity="getStatusSeverity(data.status)"
          />
        </template>
      </Column>
      <Column field="createdAt" header="Дата подачи" sortable>
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
              v-if="data.status === 'PENDING'"
              icon="pi pi-check"
              severity="success"
              text
              rounded
              @click="$emit('approve', data)"
            />
            <Button
              v-if="data.status === 'PENDING'"
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              @click="$emit('reject', data)"
            />
            <Button
              icon="pi pi-reply"
              severity="warning"
              text
              rounded
              @click="$emit('reply', data)"
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
import { formatDate, truncateText, getStatusLabel, getStatusSeverity } from "../model/useSubmissionsTable";
import type { SubmissionsTableProps, SubmissionsTableEmits, Submission } from "../model/types";

const props = defineProps<SubmissionsTableProps>();
const emit = defineEmits<SubmissionsTableEmits>();

const selectedSubmissions = computed({
  get: () => props.selectedSubmissions,
  set: (value) => emit("update:selectedSubmissions", value),
});
</script>

<style scoped src="../style/admin-submissions-table.css"></style>

