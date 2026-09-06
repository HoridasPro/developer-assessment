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

const acceptInvitation = async (
  userId: string,
  invitationId: string,
) => {
  const invitation =
    await prisma.assessmentInvitation.findUnique({
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

  const updatedInvitation =
    await prisma.assessmentInvitation.update({
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

  // 2. Assessment published কিনা
  if (assessment.status !== "PUBLISHED") {
    throw new Error("Assessment is not published");
  }

  const now = new Date();

  // 3. Start time check
  if (assessment.startAt && now < assessment.startAt) {
    throw new Error("Assessment has not started yet");
  }

  // 4. End time check
  if (assessment.endAt && now > assessment.endAt) {
    throw new Error("Assessment deadline has passed");
  }

  // 5. Candidate invitation check
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

  // 6. আগের attempt গুলো বের করা
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      assessmentId,
      candidateId: userId,
    },
    orderBy: {
      attemptNumber: "desc",
    },
  });

  // 7. Max attempts check
  if (attempts.length >= assessment.maxAttempts) {
    throw new Error("You have reached the maximum number of attempts");
  }

  // 8. আগে কোনো attempt চলছে কিনা
  const activeAttempt = attempts.find(
    (attempt) => attempt.status === "IN_PROGRESS",
  );

  if (activeAttempt) {
    return activeAttempt;
  }

  // 9. নতুন attempt number
  const attemptNumber = attempts.length + 1;

  // 10. নতুন attempt তৈরি
  const attempt = await prisma.assessmentAttempt.create({
    data: {
      assessmentId,
      candidateId: userId,
      attemptNumber,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
    include: {
      assessment: true,
    },
  });

  return attempt;
};

export const InvitationServices = {
  getMyInvitations,
  acceptInvitation,
  startAssessment,
};
