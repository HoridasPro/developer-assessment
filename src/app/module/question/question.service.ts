import { prisma } from "../../lib/prisma";
import {
  ICreateQuestionPayload,
  IUpdateQuestionPayload,
} from "./question.interface";

const createQuestions = async (
  userId: string,
  questions: ICreateQuestionPayload[],
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const result = await prisma.$transaction(
    questions.map((question) =>
      prisma.question.create({
        data: {
          title: question.title,
          description: question.description,
          type: question.type,
          category: question.category,
          difficulty: question.difficulty,
          marks: question.marks,
          option: question.option,

          options:
            question.type === "MCQ"
              ? {
                  create: (question.options ?? []).map((option) => ({
                    text: option.text,
                    isCorrect: option.isCorrect,
                  })),
                }
              : undefined,
        },

        include: {
          options: true,
        },
      }),
    ),
  );

  return result;
};

const getAllQuestions = async () => {
  const questions = await prisma.question.findMany({
    include: {
      options: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return questions;
};

const getQuestionById = async (questionId: string) => {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      options: true,
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  return question;
};

const deleteQuestion = async (questionId: string) => {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  await prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  return null;
};

const bulkUpdateQuestions = async (
  userId: string,
  questions: IUpdateQuestionPayload[],
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const results = [];

  for (const question of questions) {
    const existingQuestion = await prisma.question.findUnique({
      where: {
        id: question.id,
      },
    });

    if (!existingQuestion) {
      throw new Error(`Question not found: ${question.id}`);
    }

    await prisma.question.update({
      where: {
        id: question.id,
      },
      data: {
        title: question.title,
        description: question.description,
        type: question.type,
        category: question.category,
        difficulty: question.difficulty,
        marks: question.marks,
        option: question.option,
      },
    });

    if (question.type === "MCQ" && question.options) {
      await prisma.questionOption.deleteMany({
        where: {
          questionId: question.id,
        },
      });

      await prisma.questionOption.createMany({
        data: question.options.map((option) => ({
          text: option.text,
          isCorrect: option.isCorrect,
          questionId: question.id,
        })),
      });
    }

    if (question.type === "WRITTEN" || question.type === "CODING") {
      await prisma.questionOption.deleteMany({
        where: {
          questionId: question.id,
        },
      });
    }

    const result = await prisma.question.findUnique({
      where: {
        id: question.id,
      },
      include: {
        options: true,
      },
    });

    results.push(result);
  }

  return results;
};
export const QuestionService = {
  createQuestions,
  getAllQuestions,
  getQuestionById,
  deleteQuestion,
  bulkUpdateQuestions,
};
