import { prisma } from "../../lib/prisma";
import { ISubmitAnswerPayload } from "./answer.interface";

const saveAnswer = async (
  userId: string,
  attemptId: string,
  payload: ISubmitAnswerPayload,
) => {
  const { questionId, selectedOptionId, writtenAnswer, codeAnswer } = payload;

  // 1. Attempt check
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  // 2. Candidate ownership check
  if (attempt.candidateId !== userId) {
    throw new Error("You are not allowed to access this attempt");
  }

  // 3. Attempt status check
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This assessment attempt is no longer active");
  }

  // 4. Question check
  const assessmentQuestion = await prisma.assessmentQuestion.findFirst({
    where: {
      assessmentId: attempt.assessmentId,
      questionId,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!assessmentQuestion) {
    throw new Error("Question does not belong to this assessment");
  }

  const question = assessmentQuestion.questions;

  // 5. Validate answer according to question type

  // MCQ
  if (question.type === "MCQ") {
    if (!selectedOptionId) {
      throw new Error("Please select an option");
    }

    const option = await prisma.questionOption.findFirst({
      where: {
        id: selectedOptionId,
        questionId,
      },
    });

    if (!option) {
      throw new Error("Selected option does not belong to this question");
    }
  }

  // WRITTEN
  if (question.type === "WRITTEN") {
    if (!writtenAnswer || writtenAnswer.trim() === "") {
      throw new Error("Written answer is required");
    }
  }

  // CODING
  if (question.type === "CODING") {
    if (!codeAnswer || codeAnswer.trim() === "") {
      throw new Error("Code answer is required");
    }
  }

  // 6. Prepare answer data
  const answerData = {
    selectedOptionId: question.type === "MCQ" ? selectedOptionId : null,

    writtenAnswer: question.type === "WRITTEN" ? writtenAnswer : null,

    codeAnswer: question.type === "CODING" ? codeAnswer : null,
  };

  // 7. Create or update answer
  const answer = await prisma.assessmentAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },

    update: answerData,

    create: {
      attemptId,
      questionId,
      ...answerData,
    },

    include: {
      question: true,
      selectedOption: true,
    },
  });

  // 8. Candidate response
  return {
    id: answer.id,
    attemptId: answer.attemptId,
    questionId: answer.questionId,

    // MCQ
    selectedOptionId: answer.selectedOptionId,

    // Optional: selected option text
    selectedOption: answer.selectedOption
      ? {
          id: answer.selectedOption.id,
          text: answer.selectedOption.text,
        }
      : null,

    // Written
    writtenAnswer: answer.writtenAnswer,

    // Coding
    codeAnswer: answer.codeAnswer,

    createdAt: answer.createdAt,
    updatedAt: answer.updatedAt,
  };
};

export const AnswerServices = {
  saveAnswer,
};
