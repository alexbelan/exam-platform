import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

const AppTheme = definePreset(Aura, {
  primitive: {
    violet: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#2e1065",
    },
    purple: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
      950: "#3b0764",
    },
    fuchsia: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
      950: "#4a044e",
    },
  },
  semantic: {
    // Основной цвет приложения
    primary: {
      50: "{purple.50}",
      100: "{purple.100}",
      200: "{purple.200}",
      300: "{purple.300}",
      400: "{purple.400}",
      500: "{purple.500}",
      600: "{purple.600}",
      700: "{purple.700}",
      800: "{purple.800}",
      900: "{purple.900}",
      950: "{purple.950}",
    },
    // Цветовые схемы для светлой и темной тем
    colorScheme: {
      light: {
        primary: {
          color: "{purple.600}",
          contrastColor: "#ffffff",
          hoverColor: "{purple.700}",
          activeColor: "{purple.800}",
        },
        highlight: {
          background: "{purple.950}",
          focusBackground: "{purple.700}",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
      },
      dark: {
        primary: {
          color: "{purple.400}",
          contrastColor: "{purple.950}",
          hoverColor: "{purple.300}",
          activeColor: "{purple.200}",
        },
        highlight: {
          background: "rgba(168, 85, 247, 0.16)",
          focusBackground: "rgba(168, 85, 247, 0.24)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
      },
    },
  },
  components: {
    card: {
      colorScheme: {
        light: {
          root: {
            borderRadius: "20px",
            shadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          },
        },
        dark: {
          root: {
            borderRadius: "20px",
            shadow: "0 8px 24px rgba(8, 11, 26, 0.45)",
          },
        },
      },
    },
  },
});

export default {
  preset: AppTheme,
  options: {
    prefix: "p",
    darkModeSelector: "system",
    cssLayer: false,
  },
};

