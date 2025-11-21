<template>
  <Card class="project-card" @click="$emit('click')">
    <template #header>
      <div class="project-image-wrapper">
        <img
          v-if="
            project.image &&
            project.image !== '/images/placeholder-project.jpg' &&
            project.image !== '' &&
            !imageError
          "
          :src="project.image"
          :alt="project.title"
          class="project-image"
          @error="handleImageError"
        />
        <div v-else class="project-placeholder">
          <i
            :class="getProjectIcon()"
            style="font-size: 3rem; color: var(--p-text-muted-color)"
          ></i>
        </div>
      </div>
    </template>
    <template #content>
      <h3 class="project-title">{{ project.title }}</h3>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  stack: string[];
  githubLink: string;
  screenshot: string;
}

const props = defineProps<{
  project: Project;
}>();

const emit = defineEmits<{
  click: [];
}>();

const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};

const getProjectIcon = () => {
  return "pi pi-image";
};
</script>

<style scoped>
.project-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  overflow: visible;
}

.project-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  z-index: 5;
}

.project-image-wrapper {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--p-surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-surface-100);
}

.project-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0;
  text-align: center;
}

/* Dark theme adjustments */
@media (prefers-color-scheme: dark) {
  .project-card {
    background: var(--p-surface-900);
    border-color: var(--p-surface-700);
  }

  .project-image-wrapper {
    background: var(--p-surface-800);
  }

  .project-placeholder {
    background: var(--p-surface-800);
  }
}
</style>
