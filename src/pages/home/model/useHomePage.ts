import { ref } from "vue";
import type { Project } from "./types";

export function useHomePage() {
  // Получаем информацию о сессии пользователя
  const { loggedIn, user, clear, fetch } = useUserSession();

  // Projects data
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

  return {
    loggedIn,
    user,
    projects,
    navigateToLogin,
    handleStartLearning,
    handleLogout,
    fetch,
  };
}

