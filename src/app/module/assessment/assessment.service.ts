// import { prisma } from "../../lib/prisma";
// import { ICreateAssessmentPayload } from "./assessment.interface";

// const createAssessment = async (
//   userId: string,
//   payload: ICreateAssessmentPayload,
// ) => {
//   const company = await prisma.companyProfile.findUnique({
//     where: {
//       userId,
//     },
//   });

//   if (!company) {
//     throw new Error("Company profile not found");
//   }

//   // Assessment create
//   const assessment = await prisma.assessment.create({
//     data: {
//       title: payload.title,
//       description: payload.description,
//       duration: payload.duration,
//       passingScore: payload.passingScore,
//       maxAttempts: payload.maxAttempts ?? 1,

//       startAt: payload.startAt ? new Date(payload.startAt) : undefined,

//       endAt: payload.endAt ? new Date(payload.endAt) : undefined,

//       companyId: company.id,
//     },

//     // include: {
//     //   company: true,
//     // },

//     include: {
//       company: {
//         include: {
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               profilePhoto: true,
//               role: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   return assessment;
// };

// const addQuestionToAssessment = async (
//   userId: string,
//   assessmentId: string,
//   questionId: string,
//   order: number,
//   marks?: number,
// ) => {
//   // Company খুঁজে বের করা
//   const company = await prisma.companyProfile.findUnique({
//     where: {
//       userId,
//     },
//   });

//   if (!company) {
//     throw new Error("Company profile not found");
//   }

//   // Assessment ওই company-এর কিনা check
//   const assessment = await prisma.assessment.findFirst({
//     where: {
//       id: assessmentId,
//       companyId: company.id,
//     },
//   });

//   if (!assessment) {
//     throw new Error("Assessment not found");
//   }

//   // Question আছে কিনা check
//   const question = await prisma.question.findUnique({
//     where: {
//       id: questionId,
//     },
//   });

//   if (!question) {
//     throw new Error("Question not found");
//   }

//   const alreadyExists = await prisma.assessmentQuestion.findUnique({
//   where: {
//     assessmentId_questionId: {
//       assessmentId,
//       questionId,
//     },
//   },
// });

// if (alreadyExists) {
//   throw new Error("Question already added to this assessment");
// }

//   // Assessment-এর সাথে Question attach
//   const assessmentQuestion =
//     await prisma.assessmentQuestion.create({
//       data: {
//         assessmentId,
//         questionId,
//         order,
//         marks: marks ?? question.marks,
//       },
//       include: {
//         questions: {
//           include: {
//             options: true,
//           },
//         },
//       },
//     });

//   return assessmentQuestion;
// };

// const publishAssessment = async (
//   userId: string,
//   assessmentId: string,
// ) => {
//   // Company খুঁজে বের করা
//   const company = await prisma.companyProfile.findUnique({
//     where: {
//       userId,
//     },
//   });

//   if (!company) {
//     throw new Error("Company profile not found");
//   }

//   // Assessment ওই company-এর কিনা check
//   const assessment = await prisma.assessment.findFirst({
//     where: {
//       id: assessmentId,
//       companyId: company.id,
//     },
//   });

//   if (!assessment) {
//     throw new Error("Assessment not found");
//   }

//   // Already published কিনা
//   if (assessment.status === "PUBLISHED") {
//     throw new Error("Assessment is already published");
//   }

//   // অন্তত একটি question আছে কিনা
//   const questionCount = await prisma.assessmentQuestion.count({
//     where: {
//       assessmentId,
//     },
//   });

//   if (questionCount === 0) {
//     throw new Error(
//       "Cannot publish assessment without questions",
//     );
//   }

//   // Publish assessment
//   const publishedAssessment =
//     await prisma.assessment.update({
//       where: {
//         id: assessmentId,
//       },
//       data: {
//         status: "PUBLISHED",
//       },
//       include: {
//         company: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 profilePhoto: true,
//                 role: true,
//               },
//             },
//           },
//         },
//         assessmentQuestions: {
//           include: {
//             questions: {
//               include: {
//                 options: true,
//               },
//             },
//           },
//           orderBy: {
//             order: "asc",
//           },
//         },
//       },
//     });

//   return publishedAssessment;
// };

// export const AssessmentService = {
//   createAssessment,
//   addQuestionToAssessment,
//   publishAssessment
// };
