<template>
  <div class="tag-filter-skeleton">
    <div v-for="index in 3" :key="index" class="tag-filter-skeleton__group">
      <Skeleton
        height="1.2rem"
        width="70%"
        class="tag-filter-skeleton__title"
      />
      <div class="tag-filter-skeleton__chips">
        <Skeleton
          v-for="chip in 4"
          :key="chip"
          height="1rem"
          width="3rem"
          class="tag-filter-skeleton__chip"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from "primevue/skeleton";
</script>

<style scoped src="../style/tag-filter-skeleton.css"></style>
