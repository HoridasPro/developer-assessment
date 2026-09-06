// import { prisma } from "../../lib/prisma";

// const getMyInvitations = async (userId: string) => {
//   const invitations = await prisma.assessmentInvitation.findMany({
//     where: {
//       candidateUserId: userId,
//     },
//     include: {
//       assessment: {
//         select: {
//           id: true,
//           title: true,
//           description: true,
//           duration: true,
//           passingScore: true,
//           maxAttempts: true,
//           startAt: true,
//           endAt: true,
//           status: true,
//         },
//       },
//     },
//     orderBy: {
//       invitedAt: "desc",
//     },
//   });

//   return invitations;
// };

// const acceptInvitation = async (
//   userId: string,
//   invitationId: string,
// ) => {
//   const invitation =
//     await prisma.assessmentInvitation.findUnique({
//       where: {
//         id: invitationId,
//       },
//       include: {
//         assessment: true,
//       },
//     });

//   if (!invitation) {
//     throw new Error("Invitation not found");
//   }

//   if (invitation.candidateUserId !== userId) {
//     throw new Error("This invitation does not belong to you");
//   }

//   if (invitation.status !== "PENDING") {
//     throw new Error("Invitation is already accepted or processed");
//   }

//   if (invitation.assessment.status !== "PUBLISHED") {
//     throw new Error("Assessment is not published");
//   }

//   const now = new Date();

//   if (invitation.assessment.startAt) {
//     if (now < invitation.assessment.startAt) {
//       throw new Error("Assessment has not started yet");
//     }
//   }

//   if (invitation.assessment.endAt) {
//     if (now > invitation.assessment.endAt) {
//       throw new Error("Assessment deadline has passed");
//     }
//   }

//   const updatedInvitation =
//     await prisma.assessmentInvitation.update({
//       where: {
//         id: invitationId,
//       },
//       data: {
//         status: "ACCEPTED",
//         acceptedAt: new Date(),
//       },
//       include: {
//         assessment: true,
//       },
//     });

//   return updatedInvitation;
// };

// export const CandidateAssessmentService = {
//   getMyInvitations: getMyInvitations,
//   acceptInvitation,
// };