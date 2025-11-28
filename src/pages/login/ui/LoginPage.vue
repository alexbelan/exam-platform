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
        <div v-if="isTelegramWebApp" class="telegram-login">
          <div v-if="!isSubscribed" class="subscription-warning">
            <i
              class="pi pi-exclamation-triangle"
              style="margin-right: 0.5rem"
            ></i>
            <p>Для доступа необходимо подписаться на канал</p>
            <Button
              label="Подписаться на канал"
              icon="pi pi-external-link"
              @click="openChannel"
            />
          </div>

          <Button
            v-else
            label="Войти через Telegram"
            icon="pi pi-send"
            class="w-full"
            :loading="loading"
            @click="handleTelegramLogin"
          />
        </div>

        <!-- Для десктопа/браузера -->
        <div v-else class="desktop-login">
          <p class="mb-3 text-center">
            Для входа откройте приложение в Telegram
          </p>
          <div class="info-box">
            <i class="pi pi-info-circle" style="margin-right: 0.5rem"></i>
            Используйте Telegram Web App для авторизации
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import { useLoginPage } from "../model/useLoginPage";

const {
  loading,
  isSubscribed,
  isTelegramWebApp,
  openChannel,
  handleTelegramLogin,
} = useLoginPage();
</script>

<style scoped src="../style/login-page.css"></style>
