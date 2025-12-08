<template>
  <div class="password-reset-form">
    <FormInput
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="Введите email"
      required
      :error="errors.email"
      class="w-full"
      :disabled="loading"
    />

    <Button
      label="Отправить код"
      icon="pi pi-send"
      class="w-full"
      :loading="loading"
      :disabled="!isFormValid"
      @click="handleSubmit"
    />

    <Button
      v-if="showBackButton && onBack"
      label="Вернуться"
      icon="pi pi-arrow-left"
      class="w-full p-button-text"
      :disabled="loading"
      @click="onBack"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "primevue/button";
import { FormInput } from "@shared/ui";
import type {
  PasswordResetFormProps,
  PasswordResetFormEmits,
  PasswordResetFormData,
} from "../model/types";

withDefaults(defineProps<PasswordResetFormProps>(), {
  loading: false,
  showBackButton: false,
  onBack: undefined,
});

const emit = defineEmits<PasswordResetFormEmits>();

const form = ref<PasswordResetFormData>({
  email: "",
});

const errors = ref<{ email?: string }>({});

const isFormValid = computed(() => {
  return form.value.email.trim().length > 0;
});

const handleSubmit = () => {
  errors.value = {};

  if (!form.value.email.trim()) {
    errors.value.email = "Email обязателен";
    return;
  }

  emit("submit", {
    email: form.value.email.trim(),
  });
};
</script>

<style scoped>
.password-reset-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.w-full {
  width: 100%;
}
</style>
