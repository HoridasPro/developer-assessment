export interface ISubmitAnswerPayload {
  questionId: string;
  selectedOptionId?: string;
  writtenAnswer?: string;
  codeAnswer?: string;
  language?: string;
}
