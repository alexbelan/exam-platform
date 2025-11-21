export interface Answer {
  id: number;
  text: string;
}

export interface AnswerOptionProps {
  answer: Answer;
  type: "radio" | "checkbox";
  name?: string;
  isSelected: boolean;
}

