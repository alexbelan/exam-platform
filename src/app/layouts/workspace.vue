<template>
  <div class="workspace-layout">
    <!-- Desktop Sidebar -->
    <aside class="workspace-sidebar desktop-only">
      <div class="workspace-logo">
        <h2>Workspace</h2>
      </div>

      <div class="workspace-sidebar__menu">
        <WorkspaceNavigationMenu />
      </div>

      <div class="workspace-sidebar__footer">
        <AuthButton severity="secondary" />
      </div>
    </aside>

    <main class="workspace-content">
      <Header :title="pageTitle">
        <template #actions>
          <!-- Mobile: Menu button -->
          <Button
            v-if="isMobile"
            icon="pi pi-bars"
            severity="secondary"
            class="mobile-menu-button"
            @click="showMobileMenu"
            aria-label="Открыть меню"
          />
          <slot name="actions" />
        </template>
      </Header>

      <section class="workspace-main">
        <slot />
      </section>
    </main>

    <!-- Mobile/Tablet Drawer -->
    <MobileMenu
      v-model:visible="drawerVisible"
      header="Workspace"
      position="left"
    >
      <template #header>
        <div class="workspace-logo">
          <h2>Workspace</h2>
        </div>
      </template>

      <WorkspaceNavigationMenu />

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
import { WorkspaceNavigationMenu } from "@features/workspace-navigation";
import { AuthButton } from "@features/auth-button";
import { Header } from "@shared/ui";

const drawerVisible = ref(false);
const isMobile = ref(false);
const route = useRoute();

const titles: Record<string, string> = {
  "/workspace": "Добро пожаловать",
  "/workspace/profile": "Профиль",
  "/workspace/questions": "Вопросы",
  "/workspace/tests": "Тесты",
};

const pageTitle = computed(() => titles[route.path] || "Workspace");

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024;
};

const showMobileMenu = () => {
  drawerVisible.value = true;
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
.workspace-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--p-surface-ground, #f8f9fa);
}

.workspace-sidebar {
  width: 280px;
  background: var(--p-surface-0, #ffffff);
  border-right: 1px solid var(--p-surface-border, #e9ecef);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.workspace-sidebar.desktop-only {
  display: flex;
}

/* Desktop: Sticky sidebar */
@media (min-width: 1025px) {
  .workspace-sidebar.desktop-only {
    position: sticky;
    top: 0;
    height: 100vh;
    align-self: flex-start;
  }
}

.workspace-logo {
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--p-surface-border, #e9ecef);
  display: flex;
  align-items: center;
  height: 5.66rem;
  box-sizing: border-box;
  flex-shrink: 0;
}

.workspace-logo h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--p-text-color, #2c3e50);
}

.workspace-sidebar__menu {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.workspace-sidebar__footer {
  margin-top: auto;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--p-surface-border, #e9ecef);
  display: flex;
  justify-content: center;
  background: var(--p-surface-0, #ffffff);
  flex-shrink: 0;
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
  position: relative;
}

.drawer-footer {
  padding: 1rem 0;
  border-top: 1px solid var(--p-surface-border, #e9ecef);
}

/* Специфичные стили для Drawer в этом layout */
:deep(.mobile-drawer) {
  width: 280px !important;
}

:deep(.mobile-drawer .workspace-logo) {
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
  border-top: 1px solid var(--p-surface-border, #e9ecef);
}

/* Tablet and Mobile styles */
@media (max-width: 1024px) {
  .workspace-sidebar.desktop-only {
    display: none;
  }

  .workspace-main {
    padding: 1.5rem;
  }

  /* Ensure menu button is clickable on mobile/tablet */
  .mobile-menu-button {
    position: relative !important;
    z-index: 1200 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
  }

  .workspace-content :deep(.header-actions button) {
    position: relative;
    z-index: 1200;
    pointer-events: auto;
  }
}

@media (max-width: 768px) {
  .workspace-main {
    padding: 1rem;
  }
}
</style>
