<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="admin-logo">
        <h2>Админ панель</h2>
      </div>

      <AdminNavigationMenu />
    </div>

    <div class="admin-content">
      <Header :title="pageTitle">
        <template #actions>
          <AuthButton severity="secondary" />
          <slot name="actions" />
        </template>
      </Header>

      <div class="admin-main">
        <slot />
      </div>
    </div>
    <ClientOnly>
      <Toast />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { AdminNavigationMenu } from "@features/admin-navigation-menu";
import { AuthButton } from "@features/auth-button";
import { Header } from "@shared/ui";

const pageTitle = computed(() => {
  const route = useRoute();
  const titles: Record<string, string> = {
    "/admin": "Главная",
    "/admin/users": "Управление пользователями",
    "/admin/questions": "Управление вопросами",
    "/admin/tags": "Управление тегами",
    "/admin/tag-categories": "Категории тегов",
    "/admin/tests": "Настройки тестов",
    "/admin/submissions": "Заявки пользователей",
    "/admin/settings": "Настройки системы",
  };
  return titles[route.path] || "Админ панель";
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.admin-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.admin-logo {
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  height: 5.66rem;
  box-sizing: border-box;
}

.admin-logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: white;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
