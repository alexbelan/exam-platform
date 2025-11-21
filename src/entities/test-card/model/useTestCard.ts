import type { TestCardLogicProps } from "./types";

export function useTestCard(props: TestCardLogicProps) {
  const startTest = () => props.onStartTest(props.test.id);

  return {
    startTest,
  };
}
