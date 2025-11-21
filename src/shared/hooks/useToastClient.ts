import { useToast } from "primevue/usetoast";
import type { ToastServiceMethods } from "primevue/toastservice";

export const useToastClient = (): ToastServiceMethods => {
  if (import.meta.server) {
    return {
      add: () => {},
      remove: () => {},
      removeGroup: () => {},
      removeAllGroups: () => {},
    } as ToastServiceMethods;
  }

  return useToast();
};
