<template>
  <Dialog
    :visible="props.visible"
    modal
    :style="{ width: '500px' }"
    :closable="false"
    class="admin-tag-category-modal"
  >
    <template #header>
      <div class="admin-tag-category-modal__header">
        <h3 class="admin-tag-category-modal__title">
          {{ isEditMode ? "Редактирование категории" : "Новая категория" }}
        </h3>
      </div>
    </template>

    <div class="admin-tag-category-modal__content">
      <FormInput
        v-model="form.name"
        label="Название категории"
        placeholder="Например, Frontend"
        required
      />

      <div class="admin-tag-category-modal__color">
        <ColorPicker
          v-model="form.color"
          label="Цвет категории"
          with-hex-input
          :withColorsHistory="5"
          class="admin-tag-category-modal__picker"
        />
      </div>
    </div>

    <template #footer>
      <div class="admin-tag-category-modal__footer">
        <Button label="Отмена" severity="secondary" @click="close" />
        <Button
          :label="isEditMode ? 'Сохранить' : 'Создать'"
          :loading="props.saving"
          @click="save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import { FormInput, ColorPicker } from "@shared/ui";
import { useAdminTagCategoryModal } from "../model/useAdminTagCategoryModal";
import type {
  AdminTagCategoryModalEmits,
  AdminTagCategoryModalProps,
} from "../model/types";

const props = withDefaults(defineProps<AdminTagCategoryModalProps>(), {
  visible: false,
  saving: false,
  category: null,
});

const emit = defineEmits<AdminTagCategoryModalEmits>();

const { form, isEditMode, save, close } = useAdminTagCategoryModal(props, emit);
</script>

<style scoped src="../style/admin-tag-category-modal.css"></style>
