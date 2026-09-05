import { Difficulty, QuestionType } from "../../../../generated/prisma/enums";

export interface ICreateQuestionPayload {
  title: string;
  description?: string;
  type: QuestionType;
  category: string;
  difficulty: Difficulty;
  marks: number;
  option: string;

  options?: {
    text: string;
    isCorrect: boolean;
  }[];
}

