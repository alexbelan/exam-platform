<template>
  <Dialog
    :visible="props.visible"
    modal
    :style="{ width: '480px' }"
    :closable="false"
    class="admin-tag-modal"
  >
    <template #header>
      <div class="admin-tag-modal__header">
        <h3 class="admin-tag-modal__title">
          {{ isEditMode ? "Редактирование тега" : "Новый тег" }}
        </h3>
      </div>
    </template>

    <div class="admin-tag-modal__content">
      <FormInput
        v-model="form.name"
        label="Название тега"
        placeholder="Например, React"
        required
      />

      <div class="admin-tag-modal__field">
        <label class="admin-tag-modal__label">Категория</label>
        <Dropdown
          v-model="form.categoryId"
          :options="props.categories"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите категорию"
          class="admin-tag-modal__dropdown"
        />
      </div>
    </div>

    <template #footer>
      <div class="admin-tag-modal__footer">
        <Button label="Отмена" severity="secondary" @click="close" />
        <Button
          :label="isEditMode ? 'Сохранить' : 'Создать'"
          :loading="props.saving"
          :disabled="!form.name || form.categoryId === null"
          @click="save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import { FormInput } from "@shared/ui";
import { useAdminTagModal } from "../model/useAdminTagModal";
import type { AdminTagModalEmits, AdminTagModalProps } from "../model/types";

const props = withDefaults(defineProps<AdminTagModalProps>(), {
  visible: false,
  saving: false,
  tag: null,
  categories: () => [],
});

const emit = defineEmits<AdminTagModalEmits>();

const { form, isEditMode, save, close } = useAdminTagModal(props, emit);
</script>

<style scoped src="../style/admin-tag-modal.css"></style>
