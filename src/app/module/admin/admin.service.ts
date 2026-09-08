// import { prisma } from "../../lib/prisma";

// const getAllUsers = async () => {
//   const users = await prisma.user.findMany({
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return users;
// };

// const updateUserRole = async (
//   userId: string,
//   role: "ADMIN" | "CANDIDATE" | "COMPANY",
// ) => {
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//   });

//   if (!user) {
//     throw new Error("User not found");
//   }

//   const updatedUser = await prisma.user.update({
//     where: {
//       id: userId,
//     },
//     data: {
//       role,
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//     },
//   });

//   return updatedUser;
// };

// const getDashboardStats = async () => {
//   // =========================
//   // USER STATISTICS
//   // =========================

//   const totalUsers = await prisma.user.count();

//   const totalCandidates = await prisma.user.count({
//     where: {
//       role: "CANDIDATE",
//     },
//   });

//   const totalCompanies = await prisma.user.count({
//     where: {
//       role: "COMPANY",
//     },
//   });

//   const totalAdmins = await prisma.user.count({
//     where: {
//       role: "ADMIN",
//     },
//   });

//   // =========================
//   // ASSESSMENT STATISTICS
//   // =========================

//   const totalAssessments = await prisma.assessment.count();

//   const publishedAssessments = await prisma.assessment.count({
//     where: {
//       // তোমার schema অনুযায়ী field/status adjust করবে
//       status: "PUBLISHED",
//     },
//   });

//   const draftAssessments = await prisma.assessment.count({
//     where: {
//       status: "DRAFT",
//     },
//   });

//   // =========================
//   // ATTEMPT STATISTICS
//   // =========================

//   const totalAttempts = await prisma.assessmentAttempt.count();

//   const completedAttempts = await prisma.assessmentAttempt.count({
//     where: {
//       status: "COMPLETED",
//     },
//   });

//   const inProgressAttempts = await prisma.assessmentAttempt.count({
//     where: {
//       status: "IN_PROGRESS",
//     },
//   });

//   const expiredAttempts = await prisma.assessmentAttempt.count({
//     where: {
//       status: "EXPIRED",
//     },
//   });

//   // =========================
//   // RESULT STATISTICS
//   // =========================

//   const evaluatedAttempts = await prisma.assessmentAttempt.count({
//     where: {
//       status: "COMPLETED",
//     },
//   });

//   // যদি তোমার result/score field থাকে,
//   // তাহলে passed/failed সেখান থেকে calculate করবে।
//   const passedCandidates = await prisma.assessmentAttempt.count({
//     where: {
//       status: "COMPLETED",
//       result: {
//         passed: true,
//       },
//     },
//   });

//   const failedCandidates = await prisma.assessmentAttempt.count({
//     where: {
//       status: "COMPLETED",
//       result: {
//         passed: false,
//       },
//     },
//   });

//   // =========================
//   // FINAL RESPONSE
//   // =========================

//   return {
//     users: {
//       total: totalUsers,
//       candidates: totalCandidates,
//       companies: totalCompanies,
//       admins: totalAdmins,
//     },

//     assessments: {
//       total: totalAssessments,
//       published: publishedAssessments,
//       draft: draftAssessments,
//     },

//     attempts: {
//       total: totalAttempts,
//       completed: completedAttempts,
//       inProgress: inProgressAttempts,
//       expired: expiredAttempts,
//     },

//     results: {
//       evaluated: evaluatedAttempts,
//       passed: passedCandidates,
//       failed: failedCandidates,
//     },
//   };
// };
// export const AdminServices = {
//   getAllUsers,
//   updateUserRole,
//   getDashboardStats
// };
