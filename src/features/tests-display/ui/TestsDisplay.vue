<template>
  <section class="workspace-test-display">
    <div v-if="error" class="workspace-test-display__state">
      <p>Не удалось загрузить тесты. Попробуйте ещё раз.</p>
      <Button
        label="Повторить попытку"
        icon="pi pi-refresh"
        @click="handleRefresh"
      />
    </div>

    <div v-else-if="pending" class="workspace-test-display__skeletons">
      <Skeleton
        v-for="index in 4"
        :key="index"
        height="260px"
        borderRadius="16px"
      />
    </div>

    <div v-else-if="showEmptyState" class="workspace-test-display__state">
      <p>Тесты пока не добавлены. Загляните позже.</p>
      <Button
        label="Обновить"
        icon="pi pi-refresh"
        text
        @click="handleRefresh"
      />
    </div>

    <div v-else class="workspace-test-display__grid">
      <TestCard
        v-for="test in tests"
        :key="test.id"
        :test="test"
        @start-test="handleStartTest"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { TestCard } from "@entities/test-card";
import { useTestsDisplay } from "../model/useTestsDisplay";
import type { TestsDisplayFilters } from "../model/types";

const props = defineProps<{
  filters?: TestsDisplayFilters | (() => TestsDisplayFilters);
}>();

const emit = defineEmits<{
  (event: "start-test", id: number): void;
}>();

const { tests, pending, error, refresh } = useTestsDisplay({
  filters: props.filters ?? (() => ({})),
});

const showEmptyState = computed(
  () => !pending.value && !error.value && tests.value.length === 0
);

const handleRefresh = () => refresh();
const handleStartTest = (id: number) => emit("start-test", id);
</script>

<style scoped src="../style/workspace-test-display.css"></style>
