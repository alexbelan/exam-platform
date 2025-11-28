<template>
  <div class="admin-question-form">
    <FormInput
      :model-value="form.title"
      @update:model-value="updateForm('title', $event)"
      label="Заголовок"
      required
      placeholder="Введите заголовок вопроса"
    />

    <TextEditor
      :model-value="form.content"
      @update:model-value="updateForm('content', $event)"
      label="Содержание"
      required
    />

    <FormAutoComplete
      :model-value="selectedTags"
      @update:model-value="$emit('update:selectedTags', $event)"
      label="Теги"
      multiple
      optionLabel="name"
      placeholder="Введите название тега для поиска"
      :completeMethod="searchTags"
      preventDuplicates
    />

    <FormCheckbox
      :model-value="form.isPublished"
      @update:model-value="updateForm('isPublished', $event)"
      label="Опубликовать вопрос"
    />

    <FormCheckbox
      :model-value="form.requiresPremium"
      @update:model-value="updateForm('requiresPremium', $event)"
      label="Требуется премиум подписка"
    />
  </div>
</template>

<script setup lang="ts">
import { FormInput, FormAutoComplete, FormCheckbox, TextEditor } from "@shared/ui";
import { useAdminQuestionForm } from "../model/useAdminQuestionForm";
import type { AdminQuestionFormProps, AdminQuestionFormEmits } from "../model/types";

const props = defineProps<AdminQuestionFormProps>();
const emit = defineEmits<AdminQuestionFormEmits>();

const { searchTags } = useAdminQuestionForm();

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const updateForm = (field: keyof typeof props.modelValue, value: any) => {
  emit("update:modelValue", { ...form.value, [field]: value });
};
</script>

<style scoped src="../style/admin-question-form.css"></style>

