import type { TestPreviewProps } from "./types";

export function useTestPreview(props: TestPreviewProps) {
  const goBack = () => {
    navigateTo("/workspace/tests");
  };

  return {
    goBack,
  };
}

