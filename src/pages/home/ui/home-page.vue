<template>
  <div class="home-page">
    <!-- Auth Buttons -->
    <AuthButtons
      :logged-in="loggedIn"
      :user="user"
      @login="navigateToLogin"
      @logout="handleLogout"
    />

    <!-- Hero Section -->
    <HeroSection :projects="projects" @start-learning="handleStartLearning" />
  </div>
</template>

<script setup lang="ts">
import { AuthButtons } from "./AuthButtons";
import { HeroSection } from "./HeroSection";
import { useHomePage } from "../model/useHomePage";

// SEO Meta tags
useSeoMeta({
  title: "Платформа для тестирования и подготовки",
  ogTitle: "Платформа для тестирования и подготовки",
  description:
    "Современная веб-платформа для прохождения тестов и подготовки к экзаменам. Отслеживайте прогресс и улучшайте свои знания.",
  ogDescription:
    "Современная веб-платформа для прохождения тестов и подготовки к экзаменам. Отслеживайте прогресс и улучшайте свои знания.",
  ogImage: "/og-image.jpg",
  twitterCard: "summary_large_image",
});

const {
  loggedIn,
  user,
  projects,
  navigateToLogin,
  handleStartLearning,
  handleLogout,
  fetch,
} = useHomePage();

await fetch();
</script>

<style scoped src="../style/home-page.css"></style>
