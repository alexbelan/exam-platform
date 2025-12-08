<template>
  <div class="password-reset-container">
    <Card class="password-reset-card">
      <template #title>
        <h1>
          <i
            class="pi pi-key"
            style="margin-right: 0.75rem; color: var(--p-primary-color)"
          />
          Восстановление пароля
        </h1>
      </template>
      <template #content>
        <PasswordResetFlow :on-success="handleSuccess" />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import { PasswordResetFlow } from "@features/password-reset";

const handleSuccess = async () => {
  await navigateTo("/login");
};
</script>

<style scoped>
.password-reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
}

.password-reset-card {
  width: 100%;
  max-width: 400px;
}
</style>
