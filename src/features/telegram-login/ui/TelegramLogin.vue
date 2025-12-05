<template>
  <div class="telegram-login">
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
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { useTelegramLogin } from "../model/useTelegramLogin";

const {
  loading,
  isSubscribed,
  openChannel,
  handleTelegramLogin,
} = useTelegramLogin();
</script>

<style scoped>
.telegram-login {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subscription-warning {
  padding: 1rem;
  background: var(--p-orange-50);
  border: 1px solid var(--p-orange-200);
  border-radius: 8px;
  text-align: center;
}

.w-full {
  width: 100%;
}
</style>

