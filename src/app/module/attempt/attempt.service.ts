import { title } from "node:process";
import { prisma } from "../../lib/prisma";
import { Difficulty } from "../../../../generated/prisma/enums";

const getAttemptQuestions = async (userId: string, attemptId: string) => {
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

  // 4. Get assessment questions
  const questions = await prisma.assessmentQuestion.findMany({
    where: {
      assessmentId: attempt.assessmentId,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  // 5. Remove correct answer / sensitive data
  const safeQuestions = questions.map((item) => ({
    id: item.questions.id,
    title: item.questions.title,
    description: item.questions.description,
    type: item.questions.type,
    category: item.questions.category,
    Difficulty: item.questions.difficulty,
    marks: item.questions.marks,

    options: item.questions.options.map((option) => ({
      id: option.id,
      text: option.text,
    })),
  }));

  return {
    attemptId: attempt.id,
    assessmentId: attempt.assessmentId,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    questions: safeQuestions,
  };
};

export const AttemptServices = {
  getAttemptQuestions,
};
