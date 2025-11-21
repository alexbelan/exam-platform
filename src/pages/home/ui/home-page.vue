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
    <HeroSection @start-learning="handleStartLearning" />

    <!-- Projects Section -->
    <ProjectsSection :projects="projects" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { AuthButtons } from "./AuthButtons";
import { HeroSection } from "./HeroSection";
import { ProjectsSection } from "./ProjectsSection";

// Получаем информацию о сессии пользователя
const { loggedIn, user, clear, fetch } = useUserSession();

await fetch();

console.log("user", user.value, loggedIn.value);
console.log("loggedIn", loggedIn.value);
console.log("user", user.value);

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

// Projects data
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  stack: string[];
  githubLink: string;
  screenshot: string;
}

const projects = ref<Project[]>([
  {
    id: 1,
    title: "Проект 1",
    description:
      "Описание первого проекта курса. Здесь будет подробная информация о том, что вы создадите.",
    image: "/images/placeholder-project.jpg",
    stack: ["Vue.js", "TypeScript", "Nuxt"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
  {
    id: 2,
    title: "Проект 2",
    description: "Описание второго проекта курса.",
    image: "/images/placeholder-project.jpg",
    stack: ["React", "Next.js", "TypeScript"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
  {
    id: 3,
    title: "Проект 3",
    description: "Описание третьего проекта курса.",
    image: "/images/placeholder-project.jpg",
    stack: ["Vue.js", "Pinia", "Vite"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
  {
    id: 4,
    title: "Проект 4",
    description: "Описание четвертого проекта курса.",
    image: "/images/placeholder-project.jpg",
    stack: ["TypeScript", "Node.js", "Express"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
  {
    id: 5,
    title: "Проект 5",
    description: "Описание пятого проекта курса.",
    image: "/images/placeholder-project.jpg",
    stack: ["React", "Redux", "Material-UI"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
  {
    id: 6,
    title: "Проект 6",
    description: "Описание шестого проекта курса.",
    image: "/images/placeholder-project.jpg",
    stack: ["Vue.js", "Nuxt", "TailwindCSS"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
  {
    id: 7,
    title: "Проект 7",
    description: "Описание седьмого проекта курса.",
    image: "/images/placeholder-project.jpg",
    stack: ["React", "GraphQL", "Apollo"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
  {
    id: 8,
    title: "Проект 8",
    description: "Описание восьмого проекта курса.",
    image: "/images/placeholder-project.jpg",
    stack: ["Vue.js", "Firebase", "PWA"],
    githubLink: "",
    screenshot: "/images/placeholder-project.jpg",
  },
]);

// Methods
const navigateToLogin = () => {
  navigateTo("/login");
};

const navigateToCourses = () => {
  // TODO: Создать страницу курсов
  navigateTo("/courses");
};

const handleStartLearning = () => {
  if (loggedIn.value) {
    navigateToCourses();
  } else {
    navigateToLogin();
  }
};

const handleLogout = async () => {
  try {
    await clear();
    await navigateTo("/");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
}
</style>

