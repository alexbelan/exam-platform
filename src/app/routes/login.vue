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
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label for="email">
              <i class="pi pi-envelope" style="margin-right: 0.5rem"></i>
              Email
            </label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Введите email"
              class="w-full"
              required
            />
          </div>

          <div class="field">
            <label for="password">
              <i class="pi pi-lock" style="margin-right: 0.5rem"></i>
              Пароль
            </label>
            <Password
              inputId="password"
              v-model="password"
              toggleMask
              placeholder="Введите пароль"
              :feedback="false"
              class="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            label="Войти"
            icon="pi pi-sign-in"
            class="w-full mt-3"
            :loading="loading"
          />
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Card from "primevue/card";

const { fetch, loggedIn, user } = useUserSession();

const email = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    const response = await $fetch("/api/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });
    console.log("response", response);

    console.log("loggedIn", loggedIn.value);
    console.log("user", user.value);

    if (response.success) {
      await fetch();
      await navigateTo("/");
    }
  } catch (error: any) {
    console.error("Login error:", error);

    let errorMessage = "Произошла ошибка при входе";

    if (error.statusCode === 401) {
      errorMessage = error.statusMessage || "Неверный email или пароль";
    } else if (error.statusCode === 400) {
      errorMessage = error.statusMessage || "Заполните все поля";
    }

    // Здесь можно добавить toast уведомление или другой способ показа ошибки
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.field label {
  font-weight: 600;
  color: var(--text-color);
}

.w-full {
  width: 100%;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
