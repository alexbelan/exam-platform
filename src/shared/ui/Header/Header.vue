<template>
  <header class="header">
    <h1>{{ title }}</h1>
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<style scoped>
.header {
  background: white;
  padding: 0 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5.66rem;
  box-sizing: border-box;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.2;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 768px) {
  .header {
    padding: 0 1.5rem;
    height: 4.92rem;
  }
}
</style>

