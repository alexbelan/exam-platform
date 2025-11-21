import { ref, watch, type Ref } from "vue";
import { storage } from "@shared/utils";

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const data = ref<T>(
    storage.get<T>(key, defaultValue) ?? defaultValue
  ) as Ref<T>;

  watch(
    data,
    (newValue) => {
      storage.set(key, newValue);
    },
    { deep: true }
  );

  return data;
}
