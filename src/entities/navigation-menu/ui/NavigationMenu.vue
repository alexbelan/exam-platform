<template>
  <nav class="navigation-menu" :style="menuStyle">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="navigation-menu__link"
      :active-class="activeClass"
      :exact-active-class="exactActiveClass"
    >
      <i v-if="item.icon" :class="item.icon" class="navigation-menu__icon" />
      <span class="navigation-menu__label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import type { NavigationMenuProps } from "../model/types";
import { useNavigationMenu } from "../model/useNavigationMenu";

const props = withDefaults(defineProps<NavigationMenuProps>(), {
  activeClass: "active",
  exactActiveClass: "exact-active",
});

const { menuStyle } = useNavigationMenu(props);
</script>

<style scoped src="../style/navigation-menu.css"></style>
