<template>
  <div class="email-login">
    <FormInput
      v-model="email"
      label="Email"
      type="email"
      placeholder="Введите email"
      required
      :error="emailError"
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
      v-if="showBackButton"
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
import type { EmailLoginFormProps, EmailLoginFormEmits } from "../model/types";

withDefaults(defineProps<EmailLoginFormProps>(), {
  showBackButton: false,
  onBack: () => {},
});

const emit = defineEmits<EmailLoginFormEmits>();

const email = ref("");
const emailError = ref("");

const isFormValid = computed(() => {
  return email.value.trim().length > 0;
});

const handleSubmit = () => {
  emailError.value = "";

  if (!email.value.trim()) {
    emailError.value = "Email обязателен";
    return;
  }

  emit("submit", email.value.trim());
};
</script>

<style scoped>
.email-login {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.w-full {
  width: 100%;
}
</style>
