<template>
  <div class="admin-layout">
    <!-- Desktop Sidebar -->
    <div class="admin-sidebar desktop-only">
      <div class="admin-logo">
        <h2>Админ панель</h2>
      </div>

      <div class="admin-sidebar__menu">
        <AdminNavigationMenu />
      </div>

      <div class="admin-sidebar__footer">
        <AuthButton severity="secondary" />
      </div>
    </div>

    <div class="admin-content">
      <Header :title="pageTitle">
        <template #actions>
          <!-- Mobile: Menu button -->
          <Button
            v-if="isMobile"
            icon="pi pi-bars"
            severity="secondary"
            class="mobile-menu-button"
            @click="drawerVisible = true"
            aria-label="Открыть меню"
          />
          <slot name="actions" />
        </template>
      </Header>

      <div class="admin-main">
        <slot />
      </div>
    </div>

    <!-- Mobile/Tablet Drawer -->
    <MobileMenu
      v-model:visible="drawerVisible"
      header="Админ панель"
      position="left"
    >
      <template #header>
        <div class="admin-logo">
          <h2>Админ панель</h2>
        </div>
      </template>

      <AdminNavigationMenu />

      <template #footer>
        <div class="drawer-footer">
          <AuthButton severity="secondary" />
        </div>
      </template>
    </MobileMenu>

    <ClientOnly>
      <Toast />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import Button from "primevue/button";
import { MobileMenu } from "@entities/mobile-menu";
import { AdminNavigationMenu } from "@features/admin-navigation";
import { AuthButton } from "@features/auth-button";
import { Header } from "@shared/ui";

const drawerVisible = ref(false);
const isMobile = ref(false);
const route = useRoute();

const pageTitle = computed(() => {
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

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Close drawer on route change
watch(
  () => route.path,
  () => {
    if (drawerVisible.value) {
      drawerVisible.value = false;
    }
  }
);
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--p-surface-ground, #f8f9fa);
}

.admin-sidebar {
  width: 280px;
  background: linear-gradient(
    180deg,
    var(--p-surface-900, #2c3e50) 0%,
    var(--p-surface-800, #34495e) 100%
  );
  color: var(--p-surface-0, #ffffff);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.admin-sidebar.desktop-only {
  display: flex;
}

/* Desktop: Sticky sidebar */
@media (min-width: 1025px) {
  .admin-sidebar.desktop-only {
    position: sticky;
    top: 0;
    height: 100vh;
    align-self: flex-start;
  }
}

.admin-logo {
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--p-surface-border, rgba(255, 255, 255, 0.1));
  display: flex;
  align-items: center;
  height: 5.66rem;
  box-sizing: border-box;
  flex-shrink: 0;
}

.admin-logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--p-surface-0, #ffffff);
}

.admin-sidebar__menu {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.admin-sidebar__footer {
  margin-top: auto;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--p-surface-border, rgba(255, 255, 255, 0.1));
  display: flex;
  justify-content: center;
  background: linear-gradient(
    180deg,
    var(--p-surface-900, #2c3e50) 0%,
    var(--p-surface-800, #34495e) 100%
  );
  flex-shrink: 0;
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

.drawer-footer {
  padding: 0;
  border-top: 1px solid var(--p-surface-border, rgba(255, 255, 255, 0.1));
}

/* Специфичные стили для Drawer в этом layout */
:deep(.mobile-drawer) {
  width: 280px !important;
}

:deep(.mobile-drawer .admin-logo) {
  padding: 0 1.5rem;
  border-bottom: none !important;
  display: flex;
  align-items: center;
  height: 5.66rem;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

:deep(.mobile-drawer .drawer-footer) {
  border-top: 1px solid var(--p-surface-border, rgba(255, 255, 255, 0.1));
}

/* Tablet and Mobile styles */
@media (max-width: 1024px) {
  .admin-sidebar.desktop-only {
    display: none;
  }

  .admin-main {
    padding: 1.5rem;
  }

  /* Ensure menu button is clickable on mobile/tablet */
  .mobile-menu-button {
    position: relative !important;
    z-index: 1200 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
  }

  .admin-content :deep(.header-actions button) {
    position: relative;
    z-index: 1200;
    pointer-events: auto;
  }
}

@media (max-width: 768px) {
  .admin-main {
    padding: 1rem;
  }
}
</style>
