<template>
  <div class="admin-tag-categories-create-form">
    <div class="card-header">
      <h2>Добавить категорию</h2>
      <span class="card-hint">
        Выбирайте цвет категории через встроенный Color Picker, чтобы теги в
        интерфейсе отображались единообразно.
      </span>
    </div>

    <form class="category-form" @submit.prevent="handleSubmit">
      <div class="form-row">
        <FormInput
          v-model="form.name"
          label="Название категории"
          placeholder="Например, Frontend"
          required
        />
        <ColorPicker
          v-model="form.color"
          label="Цвет"
          with-hex-input
          :withColorsHistory="5"
        />
      </div>
      <div class="form-actions">
        <Button
          type="submit"
          label="Добавить категорию"
          icon="pi pi-plus"
          :loading="creating"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { FormInput, ColorPicker } from "@shared/ui";
import { useCategoryForm } from "../model/useCategoryForm";

const emit = defineEmits<{
  (event: "submit", data: { name: string; color: string }): void;
}>();

const { form, creating, handleSubmit: handleFormSubmit } =
  useCategoryForm(async (data) => {
    emit("submit", data);
  });

const handleSubmit = () => {
  handleFormSubmit();
};
</script>

<style scoped src="../style/admin-tag-categories-create-form.css"></style>

