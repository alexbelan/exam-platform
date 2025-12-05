<template>
  <div class="email-login">
    <div class="form-group">
      <label for="email">Email:</label>
      <InputText
        id="email"
        v-model="email"
        type="email"
        placeholder="Введите email"
        class="w-full"
        :disabled="loading"
      />
    </div>
    <div class="form-group">
      <label for="password">Пароль:</label>
      <Password
        id="password"
        v-model="password"
        placeholder="Введите пароль"
        class="w-full"
        :feedback="false"
        toggleMask
        :disabled="loading"
        @keyup.enter="handleEmailLogin"
      />
    </div>
    <Button
      label="Войти"
      icon="pi pi-sign-in"
      class="w-full"
      :loading="loading"
      @click="handleEmailLogin"
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
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useEmailLogin } from "../model/useEmailLogin";
import type { EmailLoginFormProps } from "../model/types";

const props = withDefaults(defineProps<EmailLoginFormProps>(), {
  showBackButton: false,
  onBack: () => {},
});

const { loading, email, password, handleEmailLogin } = useEmailLogin();
</script>

<style scoped>
.email-login {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--p-text-color);
}

.w-full {
  width: 100%;
}
</style>

