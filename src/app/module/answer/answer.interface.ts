// export interface ISubmitAnswerPayload {
// 	questionId: string;
// 	selectedOptionId?: string;
// 	writtenAnswer?: string;
// 	codeAnswer?: string;
// }
export type ISubmitAnswerPayload =
  | {
      questionId: string;
      type: "MCQ";
      answer: {
        optionId: string;
      };
    }
  | {
      questionId: string;
      type: "WRITTEN";
      answer: {
        text: string;
      };
    }
  | {
      questionId: string;
      type: "CODING";
      answer: {
        code: string;
      };
    };
