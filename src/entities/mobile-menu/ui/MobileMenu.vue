<template>
  <Drawer
    v-model:visible="isVisible"
    :position="props.position"
    :header="props.header"
    class="mobile-drawer"
  >
    <template #header>
      <slot name="header" />
    </template>

    <slot />

    <template #footer>
      <slot name="footer" />
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import Drawer from "primevue/drawer";
import type { MobileMenuProps } from "../model/types";

const props = withDefaults(defineProps<MobileMenuProps>(), {
  visible: false,
  header: "",
  position: "left",
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const route = useRoute();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => {
    emit("update:visible", value);
  },
});

// Close drawer on route change
watch(
  () => route.path,
  () => {
    if (props.visible) {
      emit("update:visible", false);
    }
  }
);
</script>
