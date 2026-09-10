import { prisma } from "../../lib/prisma";

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

  return invitations;
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

const acceptInvitation = async (userId: string, invitationId: string) => {
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

  if (invitation.assessment.startAt) {
    if (now < invitation.assessment.startAt) {
      throw new Error("Assessment has not started yet");
    }
  }

  if (invitation.assessment.endAt) {
    if (now > invitation.assessment.endAt) {
      throw new Error("Assessment deadline has passed");
    }
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

const startAssessment = async (userId: string, assessmentId: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.status !== "PUBLISHED") {
    throw new Error("Assessment is not published");
  }

  const now = new Date();

  if (assessment.startAt && now < assessment.startAt) {
    throw new Error("Assessment has not started yet");
  }

  if (assessment.endAt && now > assessment.endAt) {
    throw new Error("Assessment deadline has passed");
  }

  const invitation = await prisma.assessmentInvitation.findFirst({
    where: {
      assessmentId: assessmentId,
      candidateUserId: userId,
      status: "ACCEPTED",
    },
  });

  if (!invitation) {
    throw new Error("You are not accepted for this assessment");
  }

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      assessmentId,
      candidateId: userId,
    },
    orderBy: {
      attemptNumber: "desc",
    },
  });

  if (attempts.length >= assessment.maxAttempts) {
    throw new Error("You have reached the maximum number of attempts");
  }

  const activeAttempt = attempts.find(
    (attempt) => attempt.status === "IN_PROGRESS",
  );

  if (activeAttempt) {
    return activeAttempt;
  }

  // duration is in minutes
  const startedAt = new Date();

  const durationMs = assessment.duration * 60 * 1000;

  const expiresAt = new Date(startedAt.getTime() + durationMs);

  const attemptNumber = attempts.length + 1;

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      assessmentId,
      candidateId: userId,
      companyId: assessment.companyId,
      attemptNumber,
      status: "IN_PROGRESS",
      startedAt,
      expiresAt,
    },
    include: {
      assessment: true,
    },
  });

  return attempt;
};

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
