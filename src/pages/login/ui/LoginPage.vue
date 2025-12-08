<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <h1>
          <i
            class="pi pi-sign-in"
            style="margin-right: 0.75rem; color: var(--p-primary-color)"
          />
          {{
            isTelegramWebApp
              ? "Вход в систему"
              : mode === "login"
                ? "Вход"
                : "Регистрация"
          }}
        </h1>
      </template>
      <template #content>
        <!-- Telegram Web App авторизация -->
        <div v-if="isTelegramWebApp && !showEmailForm">
          <TelegramLogin />
          <div class="mt-3">
            <div class="mode-switcher">
              <Button
                :label="
                  mode === 'login'
                    ? 'Войти через почту'
                    : 'Зарегистрироваться через почту'
                "
                :icon="mode === 'login' ? 'pi pi-envelope' : 'pi pi-user-plus'"
                class="w-full p-button-text"
                @click="showEmailForm = true"
              />
            </div>
          </div>
        </div>

        <!-- Email формы входа/регистрации -->
        <div v-if="showEmailForm">
          <!-- Переключатель режимов (только для десктопа) -->
          <div v-if="!isTelegramWebApp" class="mode-switcher mb-3">
            <div class="p-buttonset w-full">
              <Button
                label="Вход"
                :icon="mode === 'login' ? 'pi pi-sign-in' : undefined"
                :class="{
                  'p-button-primary': mode === 'login',
                  'p-button-outlined': mode !== 'login',
                }"
                class="flex-1"
                @click="mode = 'login'"
              />
              <Button
                label="Регистрация"
                :icon="mode === 'registration' ? 'pi pi-user-plus' : undefined"
                :class="{
                  'p-button-primary': mode === 'registration',
                  'p-button-outlined': mode !== 'registration',
                }"
                class="flex-1"
                @click="mode = 'registration'"
              />
            </div>
          </div>

          <!-- Форма входа -->
          <div v-if="mode === 'login'">
            <EmailLoginFlow
              :show-back-button="isTelegramWebApp"
              :on-back="() => (showEmailForm = false)"
              :on-success="handleLoginSuccess"
            />
            <div class="forgot-password-link">
              <NuxtLink to="/password-reset" class="p-button-link">
                Забыли пароль?
              </NuxtLink>
            </div>
          </div>

          <!-- Форма регистрации -->
          <EmailRegistrationFlow
            v-else
            :show-back-button="isTelegramWebApp"
            :on-back="() => (showEmailForm = false)"
            :on-success="handleRegistrationSuccess"
          />
        </div>

        <!-- Для десктопа/браузера -->
        <div v-else-if="!isTelegramWebApp" class="desktop-login">
          <div v-if="!showEmailForm">
            <p class="mb-3 text-center">
              Для входа откройте приложение в Telegram или используйте email
            </p>
            <div class="mode-switcher mb-3">
              <div class="p-buttonset w-full">
                <Button
                  label="Вход"
                  icon="pi pi-sign-in"
                  :class="{
                    'p-button-primary': mode === 'login',
                    'p-button-outlined': mode !== 'login',
                  }"
                  class="flex-1"
                  @click="
                    showEmailForm = true;
                    mode = 'login';
                  "
                />
                <Button
                  label="Регистрация"
                  icon="pi pi-user-plus"
                  :class="{
                    'p-button-primary': mode === 'registration',
                    'p-button-outlined': mode !== 'registration',
                  }"
                  class="flex-1"
                  @click="
                    showEmailForm = true;
                    mode = 'registration';
                  "
                />
              </div>
            </div>
            <div class="info-box">
              <i class="pi pi-info-circle" style="margin-right: 0.5rem" />
              Используйте Telegram Web App для авторизации
            </div>
          </div>
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
import { EmailLoginFlow } from "@features/email-login";
import { EmailRegistrationFlow } from "@features/email-registration";

type Mode = "login" | "registration";

const showEmailForm = ref(false);
const mode = ref<Mode>("login");

// Проверяем, запущено ли приложение в Telegram
const isTelegramWebApp = computed(() => {
  if (typeof window === "undefined") return false;
  return (
    (window as Window & { Telegram?: { WebApp?: unknown } }).Telegram
      ?.WebApp !== undefined
  );
});

const handleLoginSuccess = async () => {
  await navigateTo("/");
};

const handleRegistrationSuccess = async () => {
  await navigateTo("/");
};
</script>

<style scoped src="../style/login-page.css"></style>
