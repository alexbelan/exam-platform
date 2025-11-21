import { computed } from "vue";
import type { NavigationMenuProps } from "./types";
import appTheme from "~/themes/theme";
import { resolveThemeToken } from "@shared/utils";

type ThemePrimitivePalette = Record<string, Record<string, string>>;

const themePreset = appTheme?.preset as
  | { primitive?: ThemePrimitivePalette }
  | undefined;
const themePrimitivePalette = (themePreset?.primitive ??
  {}) as ThemePrimitivePalette;

/**
 * Разрешает цвет из различных форматов:
 * - Токен темы: "{purple.950}" -> "#3b0764"
 * - CSS переменная: "var(--p-surface-0)" -> остается как есть
 * - Прямое значение: "#ffffff", "rgba(...)", "linear-gradient(...)" -> остается как есть
 */
function resolveColor(value?: string): string | undefined {
  if (!value) return undefined;

  // Если это CSS переменная или сложное значение (градиент, rgba), возвращаем как есть
  if (
    value.startsWith("var(") ||
    value.startsWith("linear-gradient") ||
    value.startsWith("rgba(") ||
    value.startsWith("rgb(")
  ) {
    return value;
  }

  // Пытаемся разрешить как токен темы
  const resolved = resolveThemeToken(value, themePrimitivePalette);
  return resolved ?? value;
}

export function useNavigationMenu(props: NavigationMenuProps) {
  const menuStyle = computed(() => {
    const styles: Record<string, string> = {};

    const bgColor = resolveColor(props.backgroundColor);
    if (bgColor) {
      styles["--nav-menu-bg"] = bgColor;
    }

    const textColor = resolveColor(props.textColor);
    if (textColor) {
      styles["--nav-menu-text"] = textColor;
    }

    const borderColor = resolveColor(props.borderColor);
    if (borderColor) {
      styles["--nav-menu-border"] = borderColor;
    }

    return styles;
  });

  return {
    menuStyle,
  };
}
