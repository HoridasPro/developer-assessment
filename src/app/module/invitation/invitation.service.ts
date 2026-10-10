import { prisma } from "../../lib/prisma";

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

//   const invitationsWithAttemptStatus = await Promise.all(
//     invitations.map(async (invitation) => {
//       const latestAttempt = await prisma.assessmentAttempt.findFirst({
//         where: {
//           assessmentId: invitation.assessmentId,
//           candidateId: userId,
//         },
//         orderBy: {
//           attemptNumber: "desc",
//         },
//       });

//       return {
//         ...invitation,
//         attemptStatus: latestAttempt?.status ?? "NOT_STARTED",
//         attemptId: latestAttempt?.id || null, // ✅ এটা যোগ করো
//       };
//     }),
//   );

//   return invitationsWithAttemptStatus;
// };

const getMyInvitations = async (userId: string) => {
  const invitations = await prisma.assessmentInvitation.findMany({
    where: {
      candidateUserId: userId,
    },
    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          passingScore: true,
          maxAttempts: true,
          startAt: true,
          endAt: true,
          status: true,
        },
      },
    },
    orderBy: {
      invitedAt: "desc",
    },
  });

  const invitationsWithAttemptStatus = await Promise.all(
    invitations.map(async (invitation) => {
      const latestAttempt = await prisma.assessmentAttempt.findFirst({
        where: {
          assessmentId: invitation.assessmentId,
          candidateId: userId,
        },
        orderBy: {
          attemptNumber: "desc",
        },
        select: {
          id: true,
          status: true,
          score: true,
          passed: true,
          attemptNumber: true,
        },
      });

      return {
        ...invitation,
        attemptStatus: latestAttempt?.status ?? "NOT_STARTED",
        attemptId: latestAttempt?.id ?? null,
        score: latestAttempt?.score ?? null,
        passed: latestAttempt?.passed ?? null,
        attemptNumber: latestAttempt?.attemptNumber ?? null,
      };
    }),
  );

  return invitationsWithAttemptStatus;
};
const cancelInvitation = async (invitationId: string, userId: string) => {
  const invitation = await prisma.assessmentInvitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.candidateUserId !== userId) {
    throw new Error("You are not allowed to cancel this invitation");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Only pending invitations can be cancelled");
  }

  const result = await prisma.assessmentInvitation.update({
    where: {
      id: invitationId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return result;
};

// const acceptInvitation = async (userId: string, invitationId: string) => {
//   const invitation = await prisma.assessmentInvitation.findUnique({
//     where: {
//       id: invitationId,
//     },
//     include: {
//       assessment: true,
//     },
//   });

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

//   const updatedInvitation = await prisma.assessmentInvitation.update({
//     where: {
//       id: invitationId,
//     },
//     data: {
//       status: "ACCEPTED",
//       acceptedAt: new Date(),
//     },
//     include: {
//       assessment: true,
//     },
//   });

//   return updatedInvitation;
// };

export const acceptInvitation = async (
  userId: string,
  invitationId: string,
) => {
  const invitation = await prisma.assessmentInvitation.findUnique({
    where: {
      id: invitationId,
    },
    include: {
      assessment: true,
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.candidateUserId !== userId) {
    throw new Error("This invitation does not belong to you");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation is already accepted or processed");
  }

  if (invitation.assessment.status !== "PUBLISHED") {
    throw new Error("Assessment is not published");
  }

  const now = new Date();

  if (invitation.assessment.startAt && now < invitation.assessment.startAt) {
    throw new Error("Assessment has not started yet");
  }

  if (invitation.assessment.endAt && now > invitation.assessment.endAt) {
    throw new Error("Assessment deadline has passed");
  }

  const updatedInvitation = await prisma.assessmentInvitation.update({
    where: {
      id: invitationId,
    },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
    include: {
      assessment: true,
    },
  });

  return updatedInvitation;
};

export const startAssessment = async (userId: string, invitationId: string) => {
  const invitation = await prisma.assessmentInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) throw new Error("Invitation not found");
  if (invitation.candidateUserId !== userId)
    throw new Error("You are not invited to this assessment");
  if (invitation.status !== "ACCEPTED")
    throw new Error("You must accept the invitation first");

  const assessment = await prisma.assessment.findUnique({
    where: { id: invitation.assessmentId },
  });

  if (!assessment) throw new Error("Assessment not found");

  console.log("========== START ASSESSMENT DEBUG ==========");
  console.log("Candidate ID:", userId);
  console.log("Invitation ID:", invitationId);
  console.log("Assessment ID:", assessment.id);
  console.log("Assessment Company ID:", assessment.companyId);
  console.log("=============================================");

  if (assessment.status !== "PUBLISHED")
    throw new Error("Assessment is not published");

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      assessmentId: invitation.assessmentId,
      candidateId: userId,
    },
    orderBy: { attemptNumber: "desc" },
  });

  if (attempts.length >= assessment.maxAttempts) {
    throw new Error("You have reached the maximum number of attempts");
  }

  const activeAttempt = attempts.find(
    (attempt) => attempt.status === "IN_PROGRESS",
  );
  if (activeAttempt) return activeAttempt;

  const startedAt = new Date();
  const durationMs = assessment.duration * 60 * 1000;
  const expiresAt = new Date(startedAt.getTime() + durationMs);
  const attemptNumber = attempts.length + 1;

  return await prisma.assessmentAttempt.create({
    data: {
      assessmentId: invitation.assessmentId,
      candidateId: userId,
      companyId: assessment.companyId,
      attemptNumber,
      status: "IN_PROGRESS",
      startedAt,
      expiresAt,
    },
    include: { assessment: true },
  });
};

// const startAssessment = async (userId: string, invitationId: string) => {
//   const invitation = await prisma.assessmentInvitation.findUnique({
//     where: {
//       id: invitationId,
//     },
//   });

//   if (!invitation) {
//     throw new Error("Invitation not found");
//   }

//   if (invitation.candidateUserId !== userId) {
//     throw new Error("You are not invited to this assessment");
//   }

//   if (invitation.status !== "ACCEPTED") {
//     throw new Error("You must accept the invitation first");
//   }

//   const assessment = await prisma.assessment.findUnique({
//     where: {
//       id: invitation.assessmentId,
//     },
//   });

//   if (!assessment) {
//     throw new Error("Assessment not found");
//   }

//   if (assessment.status !== "PUBLISHED") {
//     throw new Error("Assessment is not published");
//   }

//   const now = new Date();

//   if (assessment.startAt && now < assessment.startAt) {
//     throw new Error("Assessment has not started yet");
//   }

//   if (assessment.endAt && now > assessment.endAt) {
//     throw new Error("Assessment deadline has passed");
//   }

//   const attempts = await prisma.assessmentAttempt.findMany({
//     where: {
//       assessmentId: invitation.assessmentId,
//       candidateId: userId,
//     },
//     orderBy: {
//       attemptNumber: "desc",
//     },
//   });

//   if (attempts.length >= assessment.maxAttempts) {
//     throw new Error("You have reached the maximum number of attempts");
//   }

//   const activeAttempt = attempts.find(
//     (attempt) => attempt.status === "IN_PROGRESS",
//   );

//   if (activeAttempt) {
//     return activeAttempt;
//   }

//   const startedAt = new Date();
//   const durationMs = assessment.duration * 60 * 1000;
//   const expiresAt = new Date(startedAt.getTime() + durationMs);

//   const attemptNumber = attempts.length + 1;

//   const attempt = await prisma.assessmentAttempt.create({
//     data: {
//       assessmentId: invitation.assessmentId,
//       candidateId: userId,
//       companyId: assessment.companyId,
//       attemptNumber,
//       status: "IN_PROGRESS",
//       startedAt,
//       expiresAt,
//     },
//     include: {
//       assessment: true,
//     },
//   });

//   return attempt;
// };

const expireAttempts = async () => {
  try {
    const now = new Date();

    const result = await prisma.assessmentAttempt.updateMany({
      where: {
        status: "IN_PROGRESS",
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    if (result.count > 0) {
      throw new Error(`${result.count} assessment attempts expired`);
    }
  } catch (error) {
    console.error("Failed to expire attempts:", error);
  }
};

export default expireAttempts;
export const InvitationServices = {
  getMyInvitations,
  cancelInvitation,
  acceptInvitation,
  startAssessment,
};
