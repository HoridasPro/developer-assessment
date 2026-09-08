import { prisma } from "../../lib/prisma";
import { ICreateAssessmentPayload } from "./assessment.interface";

const createAssessment = async (
  userId: string,
  payload: ICreateAssessmentPayload,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.create({
    data: {
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      passingScore: payload.passingScore,
      maxAttempts: payload.maxAttempts ?? 1,

      startAt: payload.startAt ? new Date(payload.startAt) : undefined,

      endAt: payload.endAt ? new Date(payload.endAt) : undefined,

      companyId: company.id,
    },

    include: {
      company: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return assessment;
};
const deleteAssessment = async (
  assessmentId: string,
  companyUserId: string,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId: companyUserId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.companyId !== company.id) {
    throw new Error("You are not allowed to delete this assessment");
  }

  if (assessment.isDeleted) {
    throw new Error("Assessment is already deleted");
  }

  await prisma.assessment.update({
    where: {
      id: assessmentId,
    },
    data: {
      isDeleted: true,
    },
  });

  return {
    assessmentId,
    // message: "Assessment deleted successfully",
  };
};

const addQuestionsToAssessment = async (
  userId: string,
  assessmentId: string,
  questionsData: { questionId: string; order: number; marks?: number }[],
) => {
  const company = await prisma.companyProfile.findUnique({
    where: { userId },
  });

  if (!company) throw new Error("Company profile not found");

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, companyId: company.id },
  });

  if (!assessment) throw new Error("Assessment not found");

  // Loop/Transaction চালিয়ে প্রতিটি প্রশ্ন সেভ করুন
  const createdQuestions = await prisma.$transaction(
    questionsData.map((item) =>
      prisma.assessmentQuestion.create({
        data: {
          assessmentId,
          questionId: item.questionId,
          order: item.order,
          // marks: item.marks,
        },
        include: {
          questions: {
            include: { options: true },
          },
        },
      }),
    ),
  );

  return createdQuestions;
};

const publishAssessment = async (userId: string, assessmentId: string) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      companyId: company.id,
    },
  });
  console.log("now get assessment", assessment);

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.status === "PUBLISHED") {
    throw new Error("Assessment is already published");
  }

  const questionCount = await prisma.assessmentQuestion.count({
    where: {
      assessmentId: assessmentId,
    },
  });

  if (questionCount === 0) {
    throw new Error("Cannot publish assessment without questions");
  }

  const publishedAssessment = await prisma.assessment.update({
    where: {
      id: assessmentId,
    },
    data: {
      status: "PUBLISHED",
    },
    include: {
      company: true,

      questions: {
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return publishedAssessment;
};

const inviteCandidate = async (
  userId: string,
  assessmentId: string,
  candidateUserId: string,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      companyId: company.id,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.status !== "PUBLISHED") {
    throw new Error("Only published assessment can be sent to candidates");
  }

  const candidate = await prisma.user.findUnique({
    where: {
      id: candidateUserId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found");
  }

  if (candidate.role !== "CANDIDATE") {
    throw new Error("This user is not a candidate");
  }

  const existingInvitation = await prisma.assessmentInvitation.findUnique({
    where: {
      assessmentId_candidateUserId: {
        assessmentId,
        candidateUserId,
      },
    },
  });

  if (existingInvitation) {
    throw new Error("Candidate already invited to this assessment");
  }

  const invitation = await prisma.assessmentInvitation.create({
    data: {
      assessmentId,
      candidateUserId,
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
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return invitation;
};

const searchAssessments = async (
  companyUserId: string,
  keyword: string,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId: companyUserId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessments = await prisma.assessment.findMany({
    where: {
      companyId: company.id,
      isDeleted: false,
      OR: [
        {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return assessments;
};

export const AssessmentService = {
  createAssessment,
  deleteAssessment,
  addQuestionsToAssessment,
  publishAssessment,
  inviteCandidate,
  searchAssessments
};
