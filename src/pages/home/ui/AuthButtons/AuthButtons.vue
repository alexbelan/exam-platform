<template>
  <div class="auth-buttons">
    <div v-if="loggedIn" class="user-info">
      <span class="user-email">{{ user?.email }}</span>
      <AuthButton
        logout-label="Выйти"
        @click="$emit('logout')"
      />
    </div>
    <AuthButton
      v-else
      login-label="Войти"
      @click="$emit('login')"
    />
  </div>
</template>

<script setup lang="ts">
import { AuthButton } from "@features/auth-button";

interface Props {
  loggedIn: boolean;
  user: any;
}

defineProps<Props>();
defineEmits<{
  login: [];
  logout: [];
}>();
</script>

<style scoped>
.auth-buttons {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 10;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
}
</style>



