<template>
  <section class="hero-section">
    <div class="mobile-background">
      <img src="/images/home1.png" alt="Background" class="mobile-bg-image" />
      <div class="mobile-overlay" />
    </div>

    <div class="hero-container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Сделаем подготовку
            <span class="brand-name">{{ companyName }}</span>
          </h1>
          <p class="hero-description">
            Современная платформа для прохождения тестов и подготовки к
            экзаменам. Отслеживайте прогресс и улучшайте свои знания.
          </p>
          <div class="hero-actions">
            <Button
              label="Начать обучение"
              icon="pi pi-play"
              class="p-button-lg hero-btn-primary"
              @click="$emit('start-learning')"
            />
          </div>
        </div>
      </div>

      <div class="desktop-image">
        <div class="image-container">
          <img
            src="/images/home.webp"
            alt="Платформа для тестирования"
            class="desktop-hero-image"
          />
          <div class="image-gradient-left" />
          <div class="image-gradient-vertical" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Project } from "../../model/types";

const runtimeConfig = useRuntimeConfig();
const companyName = computed(
  () => runtimeConfig.public.companyName || "эффективной",
);

defineProps<{
  projects: Project[];
}>();

defineEmits<{
  "start-learning": [];
}>();
</script>

<style scoped>
/* Hero Section */
.hero-section {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #030712;
  color: white;
}

/* Фоновое изображение для мобильных */
.mobile-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: block;
}

.mobile-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(3, 7, 18, 0.8);
}

/* Контейнер hero */
.hero-container {
  max-width: 1280px;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 3rem;
  position: relative;
  z-index: 10;
}

.hero-content {
  width: 100%;
  position: relative;
  z-index: 5;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  color: white;
  margin: 0;
}

.brand-name {
  color: #a855f7;
}

.hero-description {
  margin-top: 1.5rem;
  font-size: 1.25rem;
  color: #9ca3af;
  line-height: 1.6;
}

.hero-actions {
  margin-top: 2rem;
}

.hero-btn-primary {
  background: linear-gradient(45deg, #a855f7, #8b5cf6);
  border: none;
  color: white;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

.hero-btn-primary:hover {
  background: linear-gradient(45deg, #9333ea, #7c3aed);
  box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3);
}

/* Изображение для десктопа */
.desktop-image {
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  height: 100vh;
  min-height: 100vh;
  width: 65%;
  z-index: 1;
  transition:
    width 0.3s ease,
    right 0.3s ease;
}

.image-container {
  position: relative;
  height: 100vh;
  min-height: 100vh;
  width: 100%;
}

.desktop-hero-image {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  object-fit: cover;
  border-radius: 0;
}

.image-gradient-left {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    #030712 0%,
    rgba(3, 7, 18, 0.8) 25%,
    rgba(3, 7, 18, 0.3) 45%,
    transparent 65%
  );
}

.image-gradient-vertical {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(
      to bottom,
      #030712 0%,
      rgba(3, 7, 18, 0.7) 15%,
      transparent 30%,
      transparent 70%,
      rgba(3, 7, 18, 0.7) 85%,
      #030712 100%
    ),
    linear-gradient(
      to right,
      transparent 80%,
      rgba(3, 7, 18, 0.5) 90%,
      #030712 100%
    );
}

/* Responsive Design */
@media (min-width: 768px) {
  .mobile-background {
    display: none;
  }

  .desktop-image {
    display: block;
  }

  .hero-container {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem 2rem 2rem 4rem;
    max-width: 1400px;
    min-height: 100vh;
  }

  .hero-content {
    width: 45%;
    max-width: 650px;
  }

  .hero-title {
    font-size: 4.5rem;
  }
}

/* Широкоформатные мониторы (16:9 и 16:10) */
@media (min-width: 1400px) and (max-aspect-ratio: 21/9) {
  .desktop-image {
    width: 55%;
    right: 10%;
  }

  .hero-container {
    max-width: 1600px;
    padding: 2rem 2rem 2rem 6rem;
    min-height: 100vh;
  }

  .hero-content {
    width: 45%;
    max-width: 750px;
  }

  .hero-title {
    font-size: 5rem;
  }

  .hero-description {
    font-size: 1.4rem;
  }
}

/* Ультраширокие мониторы 21:9 */
@media (min-width: 1400px) and (min-aspect-ratio: 21/9) {
  .desktop-image {
    width: 40%;
    right: 5%;
    max-width: 800px;
  }

  .hero-container {
    max-width: 2000px;
    padding: 2rem 2rem 2rem 8rem;
    min-height: 100vh;
  }

  .hero-content {
    width: 55%;
    max-width: 900px;
  }

  .hero-title {
    font-size: 5.5rem;
  }

  .hero-description {
    font-size: 1.5rem;
  }
}

/* Очень широкие 21:9 мониторы (3440x1440 и больше) */
@media (min-width: 2000px) and (min-aspect-ratio: 21/9) {
  .desktop-image {
    width: 35%;
    right: 8%;
    max-width: 700px;
  }

  .hero-container {
    max-width: 2400px;
    padding: 2rem 2rem 2rem 10rem;
    min-height: 100vh;
  }

  .hero-content {
    width: 60%;
    max-width: 1000px;
  }

  .hero-title {
    font-size: 6rem;
  }

  .hero-description {
    font-size: 1.6rem;
  }
}

/* Очень широкие мониторы (но не 21:9) */
@media (min-width: 1920px) and (max-aspect-ratio: 21/9) {
  .desktop-image {
    width: 50%;
    right: 15%;
  }

  .hero-container {
    max-width: 1800px;
    padding: 2rem 2rem 2rem 8rem;
    min-height: 100vh;
  }

  .hero-content {
    max-width: 850px;
  }

  .hero-title {
    font-size: 5.5rem;
  }

  .hero-description {
    font-size: 1.5rem;
  }
}

@media (max-width: 767px) {
  .mobile-background {
    display: block;
  }

  .desktop-image {
    display: none;
  }

  .hero-container {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
    min-height: 100vh;
    justify-content: center;
  }

  .hero-content {
    width: 100%;
  }

  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
