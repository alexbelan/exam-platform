<template>
  <NavigationMenu
    :items="menuItems"
    :background-color="colors.backgroundColor"
    :text-color="colors.textColor"
    :border-color="colors.borderColor"
    active-class="active"
    exact-active-class="active"
  />
</template>

<script setup lang="ts">
import { NavigationMenu } from "@entities/navigation-menu";
import { useWorkspaceNavigationMenu } from "../model/useWorkspaceNavigationMenu";

const { menuItems, colors } = useWorkspaceNavigationMenu();
</script>
