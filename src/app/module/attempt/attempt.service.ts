import { prisma } from "../../lib/prisma";

const getAttemptQuestions = async (userId: string, attemptId: string) => {
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

const cancelAttempt = async (attemptId: string, candidateId: string) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  if (attempt.candidateId !== candidateId) {
    throw new Error("You are not allowed to cancel this attempt");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Only an in-progress assessment can be cancelled");
  }

  const cancelledAttempt = await prisma.assessmentAttempt.update({
    where: {
      id: attemptId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return {
    attemptId: cancelledAttempt.id,
    status: cancelledAttempt.status,
    message: "Assessment attempt cancelled successfully",
  };
};

const submitAttempt = async (attemptId: string, candidateId: string) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      answers: {
        include: {
          question: {
            include: {
              options: true,
            },
          },

          selectedOption: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  if (attempt.candidateId !== candidateId) {
    throw new Error("You are not allowed to submit this attempt");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Assessment attempt is no longer active");
  }

  let mcqScore = 0;

  for (const answer of attempt.answers) {
    if (answer.question.type === "MCQ" && answer.selectedOptionId) {
      const selectedOption = answer.question.options.find(
        (option) => option.id === answer.selectedOptionId,
      );

      if (selectedOption?.isCorrect) {
        mcqScore += answer.question.marks;
      }
    }
  }

  const submittedAttempt = await prisma.assessmentAttempt.update({
    where: {
      id: attemptId,
    },

    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      score: mcqScore,
    },
  });

  return {
    attemptId: submittedAttempt.id,
    assessmentId: submittedAttempt.assessmentId,
    candidateId: submittedAttempt.companyId,
    attemptNumber: submittedAttempt.attemptNumber,

    status: submittedAttempt.status,

    startedAt: submittedAttempt.startedAt,

    submittedAt: submittedAttempt.submittedAt,

    score: submittedAttempt.score,

    message:
      "Assessment submitted successfully. Written and coding answers are pending evaluation.",
  };
};

const evaluateAttempt = async (attemptId: string, companyId: string) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },
    include: {
      answers: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
          selectedOption: true,
        },
      },
      assessment: true,
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  const company = await prisma.companyProfile.findUnique({
    where: {
      userId: companyId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  if (attempt.assessment.companyId !== company.id) {
    throw new Error("You are not allowed to evaluate this attempt");
  }

  if (attempt.status !== "SUBMITTED") {
    throw new Error("Assessment attempt must be submitted first");
  }

  const manualAnswers = attempt.answers.filter(
    (answer) =>
      answer.question.type === "WRITTEN" || answer.question.type === "CODING",
  );

  const unevaluatedAnswers = manualAnswers.filter(
    (answer) => !answer.evaluated,
  );

  if (unevaluatedAnswers.length > 0) {
    throw new Error(
      "Written and coding answers must be evaluated before final evaluation",
    );
  }

  let obtainedMarks = 0;

  let mcqObtainedMarks = 0;
  let writtenObtainedMarks = 0;
  let codingObtainedMarks = 0;

  let mcqTotalMarks = 0;
  let writtenTotalMarks = 0;
  let codingTotalMarks = 0;

  for (const answer of attempt.answers) {
    if (answer.question.type === "MCQ") {
      mcqTotalMarks += answer.question.marks;

      if (answer.selectedOptionId) {
        const selectedOption = answer.question.options.find(
          (option) => option.id === answer.selectedOptionId,
        );

        if (selectedOption?.isCorrect) {
          mcqObtainedMarks += answer.question.marks;
          obtainedMarks += answer.question.marks;
        }
      }
    }

    if (answer.question.type === "WRITTEN") {
      writtenTotalMarks += answer.question.marks;

      if (answer.evaluated) {
        const marks = answer.obtainedMarks ?? 0;

        writtenObtainedMarks += marks;
        obtainedMarks += marks;
      }
    }

    if (answer.question.type === "CODING") {
      codingTotalMarks += answer.question.marks;

      if (answer.evaluated) {
        const marks = answer.obtainedMarks ?? 0;

        codingObtainedMarks += marks;
        obtainedMarks += marks;
      }
    }
  }

  const totalMarks = mcqTotalMarks + writtenTotalMarks + codingTotalMarks;

  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

  const passingScore = attempt.assessment.passingScore ?? 40;

  const passed = percentage >= passingScore;

  const updatedAttempt = await prisma.assessmentAttempt.update({
    where: {
      id: attemptId,
    },
    data: {
      score: obtainedMarks,
      passed,
      status: "COMPLETED",
    },
  });

  return {
    attemptId: updatedAttempt.id,
    assessmentId: updatedAttempt.assessmentId,
    companyId: updatedAttempt.companyId,
    attemptNumber: updatedAttempt.attemptNumber,
    status: updatedAttempt.status,

    totalMarks,
    obtainedMarks,
    percentage: Number(percentage.toFixed(2)),
    passed,

    breakdown: {
      mcq: {
        totalMarks: mcqTotalMarks,
        obtainedMarks: mcqObtainedMarks,
      },

      written: {
        totalMarks: writtenTotalMarks,
        obtainedMarks: writtenObtainedMarks,
      },

      coding: {
        totalMarks: codingTotalMarks,
        obtainedMarks: codingObtainedMarks,
      },
    },
  };
};

const getAttemptResult = async (attemptId: string, candidateId: string) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      assessment: true,

      answers: {
        include: {
          question: {
            include: {
              options: true,
            },
          },

          selectedOption: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  if (attempt.candidateId !== candidateId) {
    throw new Error("You are not allowed to view this result");
  }

  if (attempt.status !== "COMPLETED") {
    throw new Error("Assessment has not been completed yet");
  }

  let mcqTotalMarks = 0;
  let mcqObtainedMarks = 0;

  let writtenTotalMarks = 0;
  let writtenObtainedMarks = 0;

  let codingTotalMarks = 0;
  let codingObtainedMarks = 0;

  for (const answer of attempt.answers) {
    if (answer.question.type === "MCQ") {
      mcqTotalMarks += answer.question.marks;

      if (answer.selectedOption?.isCorrect) {
        mcqObtainedMarks += answer.question.marks;
      }
    }

    if (answer.question.type === "WRITTEN") {
      writtenTotalMarks += answer.question.marks;

      if (answer.evaluated) {
        writtenObtainedMarks += answer.obtainedMarks ?? 0;
      }
    }

    if (answer.question.type === "CODING") {
      codingTotalMarks += answer.question.marks;

      if (answer.evaluated) {
        codingObtainedMarks += answer.obtainedMarks ?? 0;
      }
    }
  }

  const totalMarks = mcqTotalMarks + writtenTotalMarks + codingTotalMarks;

  const obtainedMarks =
    mcqObtainedMarks + writtenObtainedMarks + codingObtainedMarks;

  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

  return {
    attemptId: attempt.id,

    assessmentId: attempt.assessmentId,

    candidateId: attempt.candidateId,

    attemptNumber: attempt.attemptNumber,

    status: attempt.status,

    totalMarks,

    obtainedMarks,

    percentage: Number(percentage.toFixed(2)),

    passed: attempt.passed,

    startedAt: attempt.startedAt,

    submittedAt: attempt.submittedAt,

    breakdown: {
      mcq: {
        totalMarks: mcqTotalMarks,
        obtainedMarks: mcqObtainedMarks,
      },

      written: {
        totalMarks: writtenTotalMarks,
        obtainedMarks: writtenObtainedMarks,
      },

      coding: {
        totalMarks: codingTotalMarks,
        obtainedMarks: codingObtainedMarks,
      },
    },

    answers: attempt.answers.map((answer) => ({
      questionId: answer.question.id,

      question: answer.question.title,

      type: answer.question.type,

      marks: answer.question.marks,

      obtainedMarks: answer.obtainedMarks,

      evaluated: answer.evaluated,

      selectedOptionId: answer.selectedOptionId,

      selectedOption: answer.selectedOption?.text ?? null,

      writtenAnswer: answer.writtenAnswer,

      codeAnswer: answer.codeAnswer,
    })),
  };
};

const getAllMyAssessmentResults = async (candidateId: string) => {
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      candidateId,
      status: "COMPLETED",
    },
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      assessment: {
        include: {
          questions: {
            include: {
              questions: true,
            },
          },
        },
      },
    },
  });

  return attempts.map((attempt) => {
    const totalMarks = attempt.assessment.questions.reduce((total, item) => {
      return total + item.questions.marks;
    }, 0);

    const obtainedMarks = attempt.score ?? 0;

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    return {
      attemptId: attempt.id,
      assessmentId: attempt.assessmentId,

      assessmentTitle: attempt.assessment.title,

      attemptNumber: attempt.attemptNumber,

      status: attempt.status,

      totalMarks,
      obtainedMarks,

      percentage: Number(percentage.toFixed(2)),

      passed: attempt.passed ?? false,

      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    };
  });
};

export const AttemptServices = {
  getAttemptQuestions,
  cancelAttempt,
  submitAttempt,
  evaluateAttempt,
  getAttemptResult,
  getAllMyAssessmentResults,
};
