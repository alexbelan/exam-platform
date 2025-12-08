<template>
  <div class="email-login-code-form">
    <div class="verification-info">
      <p>
        Мы отправили код для входа на <strong>{{ email }}</strong>
      </p>
    </div>

    <div class="form-group">
      <label for="code" class="form-label">
        Код верификации <span class="required">*</span>
      </label>
      <InputOtp
        id="code"
        v-model="code"
        :length="6"
        :disabled="loading"
        class="w-full"
      />
      <small v-if="codeError" class="p-error">{{ codeError }}</small>
    </div>

    <Button
      label="Войти"
      icon="pi pi-sign-in"
      class="w-full"
      :loading="loading"
      :disabled="!isFormValid"
      @click="handleSubmit"
    />

    <div class="resend-section">
      <Button
        label="Отправить код повторно"
        icon="pi pi-refresh"
        class="p-button-text"
        :disabled="!canResend || loading"
        @click="handleResend"
      />
      <small v-if="!canResend" class="resend-countdown">
        Повторная отправка через {{ resendCountdown }} сек.
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "primevue/button";
import InputOtp from "primevue/inputotp";
import type {
  EmailLoginCodeFormProps,
  EmailLoginCodeFormEmits,
} from "../model/types";

defineProps<EmailLoginCodeFormProps>();
const emit = defineEmits<EmailLoginCodeFormEmits>();

const code = ref("");
const codeError = ref("");

const isFormValid = computed(() => {
  return code.value.length === 6;
});

const handleSubmit = () => {
  codeError.value = "";

  if (code.value.length !== 6) {
    codeError.value = "Код должен состоять из 6 цифр";
    return;
  }

  emit("submit", code.value);
};

const handleResend = () => {
  emit("resend");
};
</script>

<style scoped>
.email-login-code-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verification-info {
  padding: 0.75rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  margin-bottom: 0.5rem;
}

.verification-info p {
  margin: 0;
  color: var(--p-text-color);
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: 0.9rem;
}

.required {
  color: var(--p-error-color, #e74c3c);
}

.resend-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.resend-countdown {
  color: var(--p-text-muted-color, #6c757d);
  font-size: 0.85rem;
}

.w-full {
  width: 100%;
}
</style>
