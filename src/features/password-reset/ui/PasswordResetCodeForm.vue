<template>
  <div class="password-reset-code-form">
    <div class="verification-info">
      <p>
        Мы отправили код для сброса пароля на <strong>{{ email }}</strong>
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

    <div class="form-group">
      <label for="newPassword" class="form-label">
        Новый пароль <span class="required">*</span>
      </label>
      <Password
        id="newPassword"
        v-model="newPassword"
        placeholder="Введите новый пароль"
        :feedback="false"
        toggle-mask
        class="w-full"
        :disabled="loading"
        :input-class="{ 'p-invalid': passwordError }"
      />
      <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
    </div>

    <Button
      label="Сбросить пароль"
      icon="pi pi-key"
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
import Password from "primevue/password";
import type {
  PasswordResetCodeFormProps,
  PasswordResetCodeFormEmits,
} from "../model/types";

defineProps<PasswordResetCodeFormProps>();
const emit = defineEmits<PasswordResetCodeFormEmits>();

const code = ref("");
const newPassword = ref("");
const codeError = ref("");
const passwordError = ref("");

const isFormValid = computed(() => {
  return code.value.length === 6 && newPassword.value.length >= 8;
});

const handleSubmit = () => {
  codeError.value = "";
  passwordError.value = "";

  if (code.value.length !== 6) {
    codeError.value = "Код должен состоять из 6 цифр";
    return;
  }

  if (newPassword.value.length < 8) {
    passwordError.value = "Пароль должен быть не менее 8 символов";
    return;
  }

  emit("submit", {
    code: code.value,
    newPassword: newPassword.value,
  });
};

const handleResend = () => {
  emit("resend");
};
</script>

<style scoped>
.password-reset-code-form {
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
