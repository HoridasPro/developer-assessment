// import { prisma } from "../../lib/prisma";

// const getAttemptQuestions = async (
//   userId: string,
//   attemptId: string,
// ) => {
//   // 1. Attempt check
//   const attempt = await prisma.assessmentAttempt.findUnique({
//     where: {
//       id: attemptId,
//     },
//   });

//   if (!attempt) {
//     throw new Error("Assessment attempt not found");
//   }

//   // 2. Candidate ownership check
//   if (attempt.candidateId !== userId) {
//     throw new Error("You are not allowed to access this attempt");
//   }

//   // 3. Attempt status check
//   if (attempt.status !== "IN_PROGRESS") {
//     throw new Error("This assessment attempt is no longer active");
//   }

//   // 4. Get assessment questions
//   const questions = await prisma.assessmentQuestion.findMany({
//     where: {
//       assessmentId: attempt.assessmentId,
//     },
//     orderBy: {
//       order: "asc",
//     },
//     include: {
//       question: {
//         include: {
//           options: true,
//         },
//       },
//     },
//   });

//   // 5. Remove correct answer / sensitive data
//   const safeQuestions = questions.map((item) => ({
//     id: item.question.id,
//     question: item.question.question,
//     type: item.question.type,
//     marks: item.question.marks,

//     options: item.question.options.map((option) => ({
//       id: option.id,
//       text: option.text,
//     })),
//   }));

//   return {
//     attemptId: attempt.id,
//     assessmentId: attempt.assessmentId,
//     attemptNumber: attempt.attemptNumber,
//     status: attempt.status,
//     startedAt: attempt.startedAt,
//     questions: safeQuestions,
//   };
// };

// export const AttemptServices = {
//   getAttemptQuestions,
// };