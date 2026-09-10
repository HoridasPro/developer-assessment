import { prisma } from "../../lib/prisma";
import { ISubmitAnswerPayload } from "./answer.interface";

const saveAnswers = async (
  userId: string,
  attemptId: string,
  payload: ISubmitAnswerPayload[],
) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  if (attempt.candidateId !== userId) {
    throw new Error("You are not allowed to access this attempt");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This assessment attempt is no longer active");
  }

  const results = [];

  for (const answerPayload of payload) {
    const { questionId, selectedOptionId, writtenAnswer, codeAnswer } =
      answerPayload;

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
      throw new Error(
        `Question ${questionId} does not belong to this assessment`,
      );
    }

    const question = assessmentQuestion.questions;

    // MCQ
    if (question.type === "MCQ") {
      if (!selectedOptionId) {
        throw new Error(
          `Selected option is required for question ${questionId}`,
        );
      }

      const option = await prisma.questionOption.findFirst({
        where: {
          id: selectedOptionId,
          questionId,
        },
      });

      if (!option) {
        throw new Error(
          `Selected option does not belong to question ${questionId}`,
        );
      }
    }

    // WRITTEN
    if (question.type === "WRITTEN") {
      if (!writtenAnswer || writtenAnswer.trim() === "") {
        throw new Error(
          `Written answer is required for question ${questionId}`,
        );
      }
    }

    // CODING
    if (question.type === "CODING") {
      if (!codeAnswer || codeAnswer.trim() === "") {
        throw new Error(`Code answer is required for question ${questionId}`);
      }
    }

    const answerData = {
      selectedOptionId: question.type === "MCQ" ? selectedOptionId : null,

      writtenAnswer: question.type === "WRITTEN" ? writtenAnswer : null,

      codeAnswer: question.type === "CODING" ? codeAnswer : null,
    };

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

    results.push({
      id: answer.id,
      attemptId: answer.attemptId,
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,

      selectedOption: answer.selectedOption
        ? {
            id: answer.selectedOption.id,
            text: answer.selectedOption.text,
          }
        : null,

      writtenAnswer: answer.writtenAnswer,
      codeAnswer: answer.codeAnswer,

      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    });
  }

  return results;
};

const evaluateAnswers = async (
  attemptId: string,
  answers: { questionId: string; marks: number }[],
) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  for (const item of answers) {
    const answer = await prisma.assessmentAnswer.findFirst({
      where: {
        attemptId,
        questionId: item.questionId,
      },
      include: {
        question: true,
      },
    });

    if (!answer) {
      throw new Error(`Answer not found for question: ${item.questionId}`);
    }

    if (
      answer.question.type !== "WRITTEN" &&
      answer.question.type !== "CODING"
    ) {
      throw new Error(
        "Only WRITTEN and CODING questions can be manually evaluated",
      );
    }

    if (item.marks < 0) {
      throw new Error("Marks cannot be negative");
    }

    if (item.marks > answer.question.marks) {
      throw new Error(
        `Marks cannot be greater than ${answer.question.marks} for this question`,
      );
    }

    await prisma.assessmentAnswer.update({
      where: {
        id: answer.id,
      },
      data: {
        obtainedMarks: item.marks,
        evaluated: true,
      },
    });
  }

  return {
    message: "Answers evaluated successfully",
  };
};

export const AnswerServices = {
  saveAnswers,
  evaluateAnswers,
};
