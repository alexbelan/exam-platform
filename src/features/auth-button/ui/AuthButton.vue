<template>
  <Button
    :label="buttonLabel"
    :icon="buttonIcon"
    :severity="buttonSeverity"
    :text="text"
    :rounded="rounded"
    :loading="loading"
    :disabled="disabled"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { useAuthButton } from "../model/useAuthButton";
import type { AuthButtonProps } from "../model/types";

const props = withDefaults(defineProps<AuthButtonProps>(), {
  text: false,
  rounded: false,
  disabled: false,
  loginLabel: "Войти",
  logoutLabel: "Выйти",
  loginIcon: "pi pi-sign-in",
  logoutIcon: "pi pi-sign-out",
});

const { buttonLabel, buttonIcon, buttonSeverity, loading, handleClick } =
  useAuthButton(props);
</script>
