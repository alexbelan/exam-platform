<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :header="project?.title"
    :style="{ width: '90vw', maxWidth: '900px' }"
    class="project-modal"
    @hide="$emit('close')"
  >
    <div v-if="project" class="modal-content">
      <!-- Screenshot -->
      <div class="project-screenshot">
        <img
          :src="project.screenshot || project.image"
          :alt="project.title"
          class="screenshot-image"
        />
      </div>

      <!-- Description -->
      <div class="project-description">
        <h4>
          <i class="pi pi-info-circle" style="margin-right: 0.5rem"></i>
          Описание проекта
        </h4>
        <p>{{ project.description }}</p>
      </div>

      <!-- Tech Stack -->
      <div class="project-stack">
        <h4>
          <i class="pi pi-cog" style="margin-right: 0.5rem"></i>
          Технологии
        </h4>
        <div class="stack-tags">
          <span v-for="tech in project.stack" :key="tech" class="stack-tag">
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- GitHub Link -->
      <div class="project-link">
        <Button
          v-if="project.githubLink"
          :label="
            project.githubLink ? 'Посмотреть на GitHub' : 'GitHub (скоро)'
          "
          icon="pi pi-github"
          :disabled="!project.githubLink"
          class="github-button"
          @click="openGithub"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { computed } from "vue";

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
  visible: boolean;
  project: Project | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) emit("close");
  },
});

const openGithub = () => {
  if (props.project?.githubLink) {
    window.open(props.project.githubLink, "_blank");
  }
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project-screenshot {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--p-surface-100);
}

.screenshot-image {
  width: 100%;
  height: auto;
  display: block;
}

.project-description h4,
.project-stack h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0 0 0.75rem 0;
}

.project-description p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--p-text-muted-color);
  margin: 0;
}

.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stack-tag {
  padding: 0.5rem 1rem;
  background: var(--p-primary-50);
  color: var(--p-primary-700);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.project-link {
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
}

.github-button {
  min-width: 200px;
}

/* Dark theme adjustments */
@media (prefers-color-scheme: dark) {
  .project-screenshot {
    background: var(--p-surface-800);
  }

  .stack-tag {
    background: var(--p-primary-900);
    color: var(--p-primary-200);
  }
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .project-description h4,
  .project-stack h4 {
    font-size: 1rem;
  }

  .project-description p {
    font-size: 0.9375rem;
  }

  .stack-tag {
    font-size: 0.8125rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>
