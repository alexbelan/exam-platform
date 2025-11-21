<template>
  <div class="workspace-layout">
    <aside class="workspace-sidebar">
      <div class="workspace-logo">
        <h2>Workspace</h2>
      </div>

      <WorkspaceNavigationMenu />
    </aside>

    <main class="workspace-content">
      <Header :title="pageTitle">
        <template #actions>
          <AuthButton severity="secondary" />
          <slot name="actions" />
        </template>
      </Header>

      <section class="workspace-main">
        <slot />
      </section>
    </main>
    <ClientOnly>
      <Toast />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { WorkspaceNavigationMenu } from "@features/workspace-navigation-menu";
import { AuthButton } from "@features/auth-button";
import { Header } from "@shared/ui";

const route = useRoute();
const titles: Record<string, string> = {
  "/workspace": "Добро пожаловать",
  "/workspace/profile": "Профиль",
  "/workspace/questions": "Вопросы",
  "/workspace/tests": "Тесты",
  "/workspace/settings": "Настройки профиля",
};

const pageTitle = computed(() => titles[route.path] || "Workspace");
</script>

<style scoped>
.workspace-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.workspace-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.workspace-logo {
  padding: 0 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  height: 5.66rem;
  box-sizing: border-box;
}

.workspace-logo h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.2;
  color: #2c3e50;
}

.workspace-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.workspace-main {
  flex: 1;
  padding: 2rem;
  padding-bottom: 0;
  overflow: hidden;
  position: relative;
}

@media (max-width: 1024px) {
  .workspace-sidebar {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .workspace-layout {
    flex-direction: column;
  }

  .workspace-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }

  .workspace-main {
    padding: 1.5rem;
  }
}
</style>
