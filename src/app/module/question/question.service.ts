import { prisma } from "../../lib/prisma";
import { ICreateQuestionPayload } from "./question.interface";

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

const updateQuestion = async (
  userId: string,
  questionId: string,
  payload: Partial<ICreateQuestionPayload>,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // Question update
  await prisma.question.update({
    where: {
      id: questionId,
    },
    data: {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      category: payload.category,
      difficulty: payload.difficulty,
      marks: payload.marks,
      option: payload.option,
    },
  });

  // Options পাঠানো হলে update হবে
  if (payload.options) {
    await prisma.questionOption.deleteMany({
      where: {
        questionId,
      },
    });

    if (payload.options.length > 0) {
      await prisma.questionOption.createMany({
        data: payload.options.map((option) => ({
          text: option.text,
          isCorrect: option.isCorrect,
          questionId,
        })),
      });
    }
  }

  // Updated Question + Options
  const result = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      options: true,
    },
  });

  return result;
};

export const QuestionService = {
  createQuestions,
  getAllQuestions,
  getQuestionById,
  deleteQuestion,
  updateQuestion,
};
