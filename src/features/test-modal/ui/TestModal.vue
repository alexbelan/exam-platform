<template>
  <Dialog
    :visible="visibleValue"
    modal
    :header="modalTitle"
    class="admin-test-modal"
    :style="{ width: '520px' }"
    @update:visible="updateVisible"
    @hide="handleCancel"
  >
    <form class="admin-test-modal__form" @submit.prevent="handleSubmit">
      <FormInput
        v-model="form.name"
        label="Название теста"
        placeholder="Например, Тест по алгоритмам"
        required
        :class="{ 'p-invalid': errors.name }"
      />
      <small v-if="errors.name" class="p-error">{{ errors.name }}</small>

      <FormTextarea
        v-model="form.description"
        label="Описание"
        :rows="3"
        placeholder="Кратко опишите, что проверяет тест"
      />

      <div class="admin-test-modal__grid">
        <FormInput
          v-model="form.questionCount"
          label="Количество вопросов"
          type="number"
          :min="1"
          showButtons
          inputId="adminTestCount"
          :error="errors.questionCount"
        />
      </div>

      <FormInput
        v-model="form.questionIdsRaw"
        label="ID вопросов (через запятую)"
        placeholder="Например: 12, 34, 56"
      />
      <small class="admin-test-modal__hint">
        Укажите конкретные вопросы, если не хотите формировать тест по тегам
      </small>

      <FormSelect
        v-model="form.primaryTag"
        label="Главный тег"
        :options="tagOptionsValue"
        optionLabel="name"
        placeholder="Выберите главный тег"
        class="w-full"
        :loading="tagsLoadingValue"
      />

      <FormSelect
        v-model="form.tags"
        label="Дополнительные теги"
        :options="secondaryTagOptions"
        optionLabel="name"
        display="chip"
        filter
        class="w-full"
        :loading="tagsLoadingValue"
        multiple
      />

      <FormCheckbox v-model="form.isPublished" label="Опубликован" binary />

      <FormCheckbox v-model="form.requiresPremium" label="Требуется премиум подписка" binary />

      <div class="admin-test-modal__footer">
        <Button
          label="Отмена"
          icon="pi pi-times"
          severity="secondary"
          text
          type="button"
          @click="handleCancel"
        />
        <Button
          type="submit"
          :label="form.id ? 'Сохранить' : 'Создать'"
          icon="pi pi-save"
          :loading="savingValue"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { FormCheckbox, FormInput, FormTextarea, FormSelect } from "@shared/ui";
import type { TestModalProps, TestModalEmits } from "../model/types";
import { useTestModal } from "../model/useTestModal";

const props = withDefaults(defineProps<TestModalProps>(), {
  saving: false,
  tagsLoading: false,
  tagOptions: () => [],
  value: null,
});

const emit = defineEmits<TestModalEmits>();

const {
  form,
  errors,
  modalTitle,
  visibleValue,
  savingValue,
  tagOptionsValue,
  secondaryTagOptions,
  tagsLoadingValue,
  handleSubmit,
  handleCancel,
  updateVisible,
} = useTestModal(props, emit);
</script>

<style scoped src="../style/admin-test-modal.css"></style>
