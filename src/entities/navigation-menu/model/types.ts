export interface NavigationMenuItem {
  to: string;
  label: string;
  icon?: string;
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  /**
   * Фоновый цвет меню.
   * Может быть токеном темы "{purple.950}", CSS переменной "var(--p-surface-0)" или прямым значением "#ffffff" / "linear-gradient(...)"
   */
  backgroundColor?: string;
  /**
   * Цвет текста.
   * Может быть токеном темы "{purple.50}", CSS переменной "var(--p-text-color)" или прямым значением "#1f2937"
   */
  textColor?: string;
  /**
   * Цвет границ.
   * Может быть токеном темы "{purple.200}", CSS переменной "var(--p-surface-border)" или прямым значением "#e9ecef"
   */
  borderColor?: string;
  /**
   * Класс для активного элемента (для NuxtLink)
   */
  activeClass?: string;
  /**
   * Класс для точного совпадения активного элемента (для NuxtLink)
   */
  exactActiveClass?: string;
}

