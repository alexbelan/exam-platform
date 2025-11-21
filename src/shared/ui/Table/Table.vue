<template>
  <div class="custom-table-wrapper">
    <DataTable
      :value="data"
      :loading="loading"
      :paginator="paginator"
      :rows="rows"
      :totalRecords="totalRecords"
      :rowsPerPageOptions="rowsPerPageOptions"
      :first="first"
      :lazy="lazy"
      @page="handlePageChange"
      :class="tableClass"
    >
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :sortable="column.sortable"
        :style="column.style"
        :headerStyle="actionsHeaderStyle"
      >
        <template #body="slotProps">
          <!-- Если есть кастомный слот для этой колонки -->
          <slot
            v-if="$slots[`column-${column.field}`]"
            :name="`column-${column.field}`"
            :data="slotProps.data"
            :value="getNestedValue(slotProps.data, column.field)"
          />
          <!-- Если есть render функция в конфигурации -->
          <component
            v-else-if="column.component"
            :is="column.component"
            :data="slotProps.data"
            :value="getNestedValue(slotProps.data, column.field)"
          />
          <!-- Иначе просто текст -->
          <span v-else>
            {{ getNestedValue(slotProps.data, column.field) }}
          </span>
        </template>
      </Column>

      <!-- Колонка действий (если есть слот) -->
      <Column
        v-if="$slots.actions"
        :header="actionsHeader"
        :style="actionsStyle"
        :headerStyle="actionsHeaderStyle"
      >
        <template #body="slotProps">
          <slot name="actions" :data="slotProps.data" />
        </template>
      </Column>

      <!-- Слот для пустого состояния -->
      <template #empty>
        <slot name="empty">
          <div class="empty-state">
            {{ emptyMessage }}
          </div>
        </slot>
      </template>

      <!-- Слот для loading состояния -->
      <template #loading>
        <slot name="loading"> Загрузка данных... </slot>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts" generic="T extends ObjectType">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { ObjectType } from "@shared/types/utility";
import type { VueElement } from "vue";

export interface TableColumn<T> {
  field: string;
  header: string;
  sortable?: boolean;
  style?: string | ObjectType;
  component?: VueElement;
}

export interface PageEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

interface Props {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  paginator?: boolean;
  rows?: number;
  totalRecords?: number;
  rowsPerPageOptions?: number[];
  first?: number;
  lazy?: boolean;
  tableClass?: string;
  actionsHeader?: string;
  actionsStyle?: string | ObjectType;
  actionsHeaderStyle?: string | ObjectType;
  emptyMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  paginator: false,
  rows: 10,
  rowsPerPageOptions: () => [5, 10, 25, 50],
  first: 0,
  lazy: false,
  tableClass: "p-datatable-sm",
  actionsHeader: "Действия",
  actionsStyle: "min-width: 150px",
  emptyMessage: "Нет данных для отображения",
});

interface Emits {
  (e: "page", event: PageEvent): void;
}

const emit = defineEmits<Emits>();

const getNestedValue = (obj: ObjectType, path: string): unknown => {
  return path.split(".").reduce<unknown>((current, prop) => {
    if (typeof current === "object" && current !== null && prop in current) {
      return (current as ObjectType)[prop];
    }
    return null;
  }, obj);
};

const handlePageChange = (event: PageEvent) => {
  emit("page", event);
};
</script>

<style scoped>
.custom-table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--p-text-muted-color, #6b7280);
  font-size: 1rem;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .custom-table-wrapper {
    background: var(--p-surface-900);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
}
</style>
