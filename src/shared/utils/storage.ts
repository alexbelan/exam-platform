export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === "undefined") return defaultValue ?? null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue ?? null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};
