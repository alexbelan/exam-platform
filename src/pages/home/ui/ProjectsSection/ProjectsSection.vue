<template>
  <section class="projects-section">
    <div class="projects-container">
      <h2 class="section-title">Проекты курса</h2>
      <p class="section-subtitle">
        8 реальных проектов, которые вы создадите в процессе обучения
      </p>

      <div class="projects-slider-wrapper">
        <!-- Left Navigation Button -->
        <button
          v-if="canScrollLeft"
          class="nav-button nav-button-left"
          @click="scrollLeft"
          aria-label="Предыдущие проекты"
        >
          <i class="pi pi-chevron-left"></i>
        </button>

        <!-- Projects Slider -->
        <div
          ref="sliderRef"
          class="projects-slider"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div
            ref="sliderTrackRef"
            class="projects-track"
            :style="{ transform: `translateX(-${currentOffset}px)` }"
          >
            <div
              v-for="project in projects"
              :key="project.id"
              class="project-slide"
            >
              <ProjectCard
                class="project-slide"
                :project="project"
                @click="openProject(project)"
              />
            </div>
          </div>
        </div>

        <!-- Right Navigation Button -->
        <button
          v-if="canScrollRight"
          class="nav-button nav-button-right"
          @click="scrollRight"
          aria-label="Следующие проекты"
        >
          <i class="pi pi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Project Modal -->
    <ProjectModal
      :visible="showModal"
      :project="selectedProject"
      @close="closeProject"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import ProjectCard from "./ui/ProjectCard/ProjectCard.vue";
import ProjectModal from "./ui/ProjectModal/ProjectModal.vue";

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
  projects: Project[];
}>();

// Modal state
const showModal = ref(false);
const selectedProject = ref<Project | null>(null);

// Modal functions
const openProject = (project: Project) => {
  selectedProject.value = project;
  showModal.value = true;
};

const closeProject = () => {
  showModal.value = false;
  selectedProject.value = null;
};

// Slider state
const sliderRef = ref<HTMLElement | null>(null);
const sliderTrackRef = ref<HTMLElement | null>(null);
const currentOffset = ref(0);
const cardWidth = ref(0);
const visibleCards = ref(1);
const maxOffset = ref(0);

// Touch/swipe state
const touchStartX = ref(0);
const touchEndX = ref(0);
const isDragging = ref(false);

// Navigation visibility
const canScrollLeft = computed(() => currentOffset.value > 0);
const canScrollRight = computed(() => currentOffset.value < maxOffset.value);

// Calculate slider dimensions
const calculateDimensions = () => {
  if (!sliderRef.value || !sliderTrackRef.value) return;

  const containerWidth = sliderRef.value.offsetWidth;
  const gap = 24; // gap between cards in pixels

  // Determine number of visible cards based on screen width
  if (window.innerWidth >= 1024) {
    // Desktop - показываем столько, сколько влезает
    visibleCards.value = Math.floor((containerWidth + gap) / (300 + gap));
  } else if (window.innerWidth >= 480) {
    // Tablet and Mobile (>= 480px) - 2 карточки
    visibleCards.value = 2;
  } else {
    // Mobile (< 480px) - 1 карточка
    visibleCards.value = 1;
  }

  // Calculate card width including gap
  cardWidth.value =
    (containerWidth - gap * (visibleCards.value - 1)) / visibleCards.value;

  // Calculate max offset
  const totalWidth = props.projects.length * (cardWidth.value + gap) - gap;
  maxOffset.value = Math.max(0, totalWidth - containerWidth);
};

// Scroll functions
const scrollLeft = () => {
  const gap = 24;
  const scrollAmount = cardWidth.value + gap;
  currentOffset.value = Math.max(0, currentOffset.value - scrollAmount);
};

const scrollRight = () => {
  const gap = 24;
  const scrollAmount = cardWidth.value + gap;
  currentOffset.value = Math.min(
    maxOffset.value,
    currentOffset.value + scrollAmount
  );
};

// Touch handlers for swipe support
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches && e.touches[0]) {
    touchStartX.value = e.touches[0].clientX;
    isDragging.value = true;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !e.touches || !e.touches[0]) return;
  touchEndX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  const diff = touchStartX.value - touchEndX.value;
  const threshold = 50; // minimum swipe distance

  if (Math.abs(diff) > threshold) {
    if (diff > 0 && canScrollRight.value) {
      scrollRight();
    } else if (diff < 0 && canScrollLeft.value) {
      scrollLeft();
    }
  }
};

// Lifecycle
onMounted(() => {
  calculateDimensions();
  window.addEventListener("resize", calculateDimensions);
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateDimensions);
});
</script>

<style scoped>
/* Projects Section */
.projects-section {
  padding: 6rem 0;
  background: var(--p-surface-0);
  position: relative;
  overflow: hidden;
}

.projects-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  padding: 0 4rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  text-align: center;
  font-size: 1.125rem;
  color: var(--p-text-muted-color);
  margin: 0 0 2.5rem 0;
}

.projects-slider-wrapper {
  position: relative;
  /* padding: 0 6rem; */
  /* max-width: 100%; */
  overflow: hidden;
  margin: 0;
}

.projects-slider-wrapper::before,
.projects-slider-wrapper::after {
  content: "";
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  width: 6rem;
  z-index: 3;
  pointer-events: none;
}

.projects-slider-wrapper::before {
  left: 0;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.6) 30%,
    rgba(255, 255, 255, 0.2) 60%,
    transparent 100%
  );
}

.projects-slider-wrapper::after {
  right: 0;
  background: linear-gradient(
    to left,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.6) 30%,
    rgba(255, 255, 255, 0.2) 60%,
    transparent 100%
  );
}

.projects-slider {
  overflow: visible;
  cursor: grab;
  user-select: none;
  position: relative;
  margin: 0;
  padding: 2rem 0;
  max-width: 100%;
}

.projects-slider:active {
  cursor: grabbing;
}

.projects-track {
  display: flex;
  gap: 24px;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2rem 0;
  position: relative;
}

.project-slide {
  flex-shrink: 0;
  width: 100%;
}

/* Navigation Buttons */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 15;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-button:hover {
  background: #f3e8ff;
  border-color: #a855f7;
  color: #7c3aed;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.3);
}

.nav-button i {
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-button-left {
  left: 20px;
}

.nav-button-right {
  right: 20px;
}

/* Dark theme adjustments */
@media (prefers-color-scheme: dark) {
  .projects-section {
    background: var(--p-surface-900);
  }

  .projects-slider-wrapper::before {
    background: linear-gradient(
      to right,
      rgba(31, 41, 55, 0.9) 0%,
      rgba(31, 41, 55, 0.6) 30%,
      rgba(31, 41, 55, 0.2) 60%,
      transparent 100%
    );
  }

  .projects-slider-wrapper::after {
    background: linear-gradient(
      to left,
      rgba(31, 41, 55, 0.9) 0%,
      rgba(31, 41, 55, 0.6) 30%,
      rgba(31, 41, 55, 0.2) 60%,
      transparent 100%
    );
  }

  .nav-button {
    background: #1f2937;
    border-color: #374151;
    color: #f3f4f6;
  }

  .nav-button:hover {
    background: #581c87;
    border-color: #a855f7;
    color: #e9d5ff;
  }
}

/* Responsive Design for Projects */
@media (min-width: 1024px) {
  .project-slide {
    width: 300px; /* Фиксированная ширина для больших экранов */
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .project-slide {
    width: calc((100vw - 12rem - 48px) / 2); /* 2 карточки на планшетах */
  }

  .projects-slider-wrapper {
    padding: 0 3rem;
  }
}

@media (min-width: 480px) and (max-width: 767px) {
  .projects-section {
    padding: 4rem 0;
  }

  .projects-container {
    padding: 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .projects-slider-wrapper {
    padding: 0 3rem;
    margin: 0;
  }

  .project-slide {
    width: calc(
      (100vw - 10rem - 24px) / 2
    ); /* 2 карточки на мобильных >= 480px */
  }

  .projects-slider-wrapper::before,
  .projects-slider-wrapper::after {
    display: none;
  }

  .nav-button {
    width: 40px;
    height: 40px;
  }

  .nav-button i {
    font-size: 1rem;
  }
}

@media (max-width: 479px) {
  .projects-section {
    padding: 4rem 0;
  }

  .projects-container {
    padding: 0;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .section-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .projects-slider-wrapper {
    padding: 0 3rem;
    margin: 0 -0.5rem;
  }

  .project-slide {
    width: 100%; /* 1 карточка на мобильных < 480px */
  }

  .projects-slider-wrapper::before,
  .projects-slider-wrapper::after {
    display: none;
  }

  .nav-button {
    width: 36px;
    height: 36px;
  }

  .nav-button i {
    font-size: 1rem;
  }
}
</style>
