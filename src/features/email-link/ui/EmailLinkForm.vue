<template>
  <div class="email-link-form">
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
      v-if="props.showBackButton && props.onBack"
      label="Отменить"
      icon="pi pi-times"
      class="w-full p-button-text"
      :disabled="loading"
      @click="props.onBack"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "primevue/button";
import { FormInput } from "@shared/ui";
import type {
  EmailLinkFormProps,
  EmailLinkFormEmits,
  EmailLinkFormData,
} from "../model/types";

const props = withDefaults(defineProps<EmailLinkFormProps>(), {
  loading: false,
  showBackButton: false,
  onBack: undefined,
});

const emit = defineEmits<EmailLinkFormEmits>();

const form = ref<EmailLinkFormData>({
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
.email-link-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.w-full {
  width: 100%;
}
</style>
