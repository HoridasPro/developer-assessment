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
    if (answer.question.type === "MCQ") {
      const selectedOption = answer.question.options.find(
        (option) => option.id === answer.selectedOptionId,
      );

      const obtainedMarks = selectedOption?.isCorrect
        ? answer.question.marks
        : 0;

      await prisma.assessmentAnswer.update({
        where: {
          id: answer.id,
        },
        data: {
          obtainedMarks,
        },
      });

      mcqScore += obtainedMarks;
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

    candidateId: submittedAttempt.candidateId,

    attemptNumber: submittedAttempt.attemptNumber,

    status: submittedAttempt.status,

    startedAt: submittedAttempt.startedAt,

    submittedAt: submittedAttempt.submittedAt,

    score: submittedAttempt.score,

    message:
      "Assessment submitted successfully. Written and coding answers are pending evaluation.",
  };
};

const evaluateAttempt = async (
  attemptId: string,
  companyUserId: string,
  answers: {
    questionId: string;
    marks: number;
    type: "WRITTEN" | "CODING";
  }[],
) => {
  if (!Array.isArray(answers)) {
    throw new Error("Answers must be an array");
  }

  // ==========================================
  // 1. Get Attempt
  // ==========================================

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
      userId: companyUserId,
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

  for (const evaluation of answers) {
    const answer = attempt.answers.find(
      (item) => item.questionId === evaluation.questionId,
    );

    if (!answer) {
      throw new Error(`Question answer not found: ${evaluation.questionId}`);
    }

    if (
      answer.question.type !== "WRITTEN" &&
      answer.question.type !== "CODING"
    ) {
      throw new Error(
        `Question ${evaluation.questionId} does not require manual evaluation`,
      );
    }

    // Check type
    if (answer.question.type !== evaluation.type) {
      throw new Error(
        `Invalid question type for question ${evaluation.questionId}`,
      );
    }

    // Check negative marks
    if (evaluation.marks < 0) {
      throw new Error("Marks cannot be negative");
    }

    // Check maximum marks
    if (evaluation.marks > answer.question.marks) {
      throw new Error(
        `Marks cannot be greater than ${answer.question.marks} for "${answer.question.title}"`,
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const evaluation of answers) {
      const answer = attempt.answers.find(
        (item) => item.questionId === evaluation.questionId,
      );

      if (!answer) {
        throw new Error("Answer not found");
      }

      await tx.assessmentAnswer.update({
        where: {
          id: answer.id,
        },
        data: {
          obtainedMarks: evaluation.marks,
          evaluated: true,
        },
      });
    }
  });

  const updatedAttempt = await prisma.assessmentAttempt.findUnique({
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

  if (!updatedAttempt) {
    throw new Error("Assessment attempt not found");
  }

  const manualAnswers = updatedAttempt.answers.filter(
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

  for (const answer of updatedAttempt.answers) {
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

      const marks = answer.obtainedMarks ?? 0;

      writtenObtainedMarks += marks;
      obtainedMarks += marks;
    }

    if (answer.question.type === "CODING") {
      codingTotalMarks += answer.question.marks;

      const marks = answer.obtainedMarks ?? 0;

      codingObtainedMarks += marks;
      obtainedMarks += marks;
    }
  }

  const totalMarks = mcqTotalMarks + writtenTotalMarks + codingTotalMarks;

  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

  const passingScore = updatedAttempt.assessment.passingScore ?? 40;

  const passed = percentage >= passingScore;

  const finalAttempt = await prisma.assessmentAttempt.update({
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
    attemptId: finalAttempt.id,

    assessmentId: finalAttempt.assessmentId,

    companyId: finalAttempt.companyId,

    attemptNumber: finalAttempt.attemptNumber,

    status: finalAttempt.status,

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

const getAttemptResult = async (candidateUserId: string, attemptId: string) => {
  const candidate = await prisma.user.findUnique({
    where: {
      id: candidateUserId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found");
  }

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          passingScore: true,
        },
      },

      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      answers: {
        include: {
          question: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              category: true,
              difficulty: true,
              marks: true,

              options: {
                select: {
                  id: true,
                  text: true,
                  isCorrect: true,
                },
              },
            },
          },

          selectedOption: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }

  if (attempt.candidateId !== candidateUserId) {
    throw new Error("You are not allowed to view this result");
  }

  if (attempt.status !== "COMPLETED") {
    throw new Error("Assessment result is not available yet");
  }

  return {
    id: attempt.id,

    assessment: {
      id: attempt.assessment.id,
      title: attempt.assessment.title,
      description: attempt.assessment.description,
      duration: attempt.assessment.duration,
      passingScore: attempt.assessment.passingScore,
    },

    candidate: {
      id: attempt.candidate.id,
      name: attempt.candidate.name,
      email: attempt.candidate.email,
    },

    attemptNumber: attempt.attemptNumber,

    status: attempt.status,

    startedAt: attempt.startedAt,

    submittedAt: attempt.submittedAt,

    expiresAt: attempt.expiresAt,

    score: attempt.score,

    passed: attempt.passed,

    answers: attempt.answers.map((answer) => ({
      id: answer.id,

      questionId: answer.questionId,

      question: {
        id: answer.question.id,

        title: answer.question.title,

        description: answer.question.description,

        type: answer.question.type,

        category: answer.question.category,

        difficulty: answer.question.difficulty,

        marks: answer.question.marks,

        options: answer.question.options.map((option) => ({
          id: option.id,
          text: option.text,
        })),
      },

      selectedOptionId: answer.selectedOptionId,

      selectedOption: answer.selectedOption
        ? {
            id: answer.selectedOption.id,

            text: answer.selectedOption.text,
          }
        : null,

      writtenAnswer: answer.writtenAnswer,

      codeAnswer: answer.codeAnswer,

      obtainedMarks: answer.obtainedMarks,
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

export const getAttemptDetailsForCompany = async (
  companyId: string,
  attemptId: string,
) => {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          description: true,
          passingScore: true,
          duration: true,
          companyId: true,
        },
      },
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          candidateProfile: {
            select: {
              bio: true,
              phone: true,
              location: true,
              skills: true,
              experience: true,
              education: true,
              resumeUrl: true,
              portfolioUrl: true,
              githubUrl: true,
              linkedinUrl: true,
            },
          },
        },
      },
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
  console.log("Logged in Company ID:", companyId);
  console.log("Attempt Company ID:", attempt.companyId);

  if (
    attempt.companyId !== companyId &&
    attempt.assessment.companyId !== companyId
  ) {
    throw new Error("You are not allowed to access this attempt");
  }

  return {
    id: attempt.id,
    assessment: attempt.assessment,
    candidate: attempt.candidate,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    expiresAt: attempt.expiresAt,
    score: attempt.score,
    answers: attempt.answers.map((answer) => ({
      id: answer.id,
      questionId: answer.questionId,
      question: {
        id: answer.question.id,
        title: answer.question.title,
        description: answer.question.description,
        type: answer.question.type,
        category: answer.question.category,
        difficulty: answer.question.difficulty,
        marks: answer.question.marks,
        options: answer.question.options.map((option) => ({
          id: option.id,
          text: option.text,
          ...(answer.question.type === "MCQ"
            ? { isCorrect: option.isCorrect }
            : {}),
        })),
      },
      selectedOptionId: answer.selectedOptionId,
      selectedOption: answer.selectedOption
        ? {
            id: answer.selectedOption.id,
            text: answer.selectedOption.text,
          }
        : null,
      writtenAnswer: answer.writtenAnswer,
      codeAnswer: answer.codeAnswer,
    })),
  };
};

export const getCompanyAttempts = async (companyId: string) => {
  console.log("Service-a Incoming Company ID:", companyId);

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      OR: [
        {
          companyId: companyId,
        },
        {
          assessment: {
            companyId: companyId,
          },
        },
      ],
    },

    select: {
      id: true,
      candidateId: true,
      assessmentId: true,
      status: true,
      submittedAt: true,
      startedAt: true,
      score: true,
      passed: true,
      attemptNumber: true,

      assessment: {
        select: {
          title: true,
          companyId: true,
        },
      },

      candidate: {
        select: {
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
    },

    orderBy: {
      startedAt: "desc",
    },
  });

  console.log("DB Result:", attempts);

  return attempts;
};

export const AttemptServices = {
  getAttemptQuestions,
  cancelAttempt,
  submitAttempt,
  evaluateAttempt,
  getAttemptResult,
  getAllMyAssessmentResults,
  getAttemptDetailsForCompany,
  getCompanyAttempts,
};
