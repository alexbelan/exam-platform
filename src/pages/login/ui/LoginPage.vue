<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <h1>
          <i
            class="pi pi-sign-in"
            style="margin-right: 0.75rem; color: var(--p-primary-color)"
          ></i>
          Вход в систему
        </h1>
      </template>
      <template #content>
        <!-- Telegram Web App авторизация -->
        <div v-if="isTelegramWebApp && !showEmailForm">
          <TelegramLogin />
          <div class="mt-3">
            <Button
              label="Войти через почту"
              icon="pi pi-envelope"
              class="w-full p-button-text"
              @click="showEmailForm = true"
            />
          </div>
        </div>

        <!-- Email форма входа -->
        <div v-if="showEmailForm">
          <EmailLoginForm
            :show-back-button="isTelegramWebApp"
            :on-back="() => (showEmailForm = false)"
          />
        </div>

        <!-- Для десктопа/браузера -->
        <div v-else-if="!isTelegramWebApp" class="desktop-login">
          <div v-if="!showEmailForm">
            <p class="mb-3 text-center">
              Для входа откройте приложение в Telegram или войдите через email
            </p>
            <Button
              label="Войти через почту"
              icon="pi pi-envelope"
              class="w-full mb-3"
              @click="showEmailForm = true"
            />
            <div class="info-box">
              <i class="pi pi-info-circle" style="margin-right: 0.5rem"></i>
              Используйте Telegram Web App для авторизации
            </div>
          </div>
          <EmailLoginForm
            v-else
            :show-back-button="true"
            :on-back="() => (showEmailForm = false)"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import { TelegramLogin } from "@features/telegram-login";
import { EmailLoginForm } from "@features/email-login";

const showEmailForm = ref(false);

// Проверяем, запущено ли приложение в Telegram
const isTelegramWebApp = computed(() => {
  if (typeof window === "undefined") return false;
  return (
    (window as Window & { Telegram?: { WebApp?: unknown } }).Telegram
      ?.WebApp !== undefined
  );
});
</script>

<style scoped src="../style/login-page.css"></style>
