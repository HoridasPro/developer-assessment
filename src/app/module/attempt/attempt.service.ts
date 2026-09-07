import { prisma } from "../../lib/prisma";

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


const submitAttempt = async (
  attemptId: string,
  candidateId: string
) => {

  // 1. Find attempt
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


  // 2. Attempt not found
  if (!attempt) {
    throw new Error("Assessment attempt not found");
  }


  // 3. Candidate ownership check
  if (attempt.candidateId !== candidateId) {
    throw new Error(
      "You are not allowed to submit this attempt"
    );
  }


  // 4. Check attempt status
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error(
      "Assessment attempt is no longer active"
    );
  }

 
  let mcqScore = 0;

  for (const answer of attempt.answers) {

    // Only MCQ
    if (
      answer.question.type === "MCQ" &&
      answer.selectedOptionId
    ) {

      const selectedOption =
        answer.question.options.find(
          (option) =>
            option.id === answer.selectedOptionId
        );


      // Correct answer
      if (selectedOption?.isCorrect) {
        mcqScore += answer.question.marks;
      }
    }
  }


   
  const submittedAttempt =
    await prisma.assessmentAttempt.update({
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


 
export const AttemptServices = {
  getAttemptQuestions,
  submitAttempt
};
