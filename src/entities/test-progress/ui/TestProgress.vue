<template>
  <div class="test-progress">
    <span class="test-progress__text">
      Вопрос {{ current }} из {{ total }}
    </span>
    <div class="test-progress__bar">
      <div
        class="test-progress__fill"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { TestProgressProps } from "../model/types";

const props = defineProps<TestProgressProps>();

const percentage = computed(() => (props.current / props.total) * 100);
</script>

<style scoped src="../style/test-progress.css"></style>

