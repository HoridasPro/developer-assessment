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

  // Assessment create
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

    // include: {
    //   company: true,
    // },

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

const addQuestionToAssessment = async (
  userId: string,
  assessmentId: string,
  questionId: string,
  order: number,
  marks?: number,
) => {
  // Company খুঁজে বের করা
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  // Assessment ওই company-এর কিনা check
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      companyId: company.id,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  // Question আছে কিনা check
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const alreadyExists = await prisma.assessmentQuestion.findUnique({
    where: {
      assessmentId_questionId: {
        assessmentId,
        questionId,
      },
    },
  });

  if (alreadyExists) {
    throw new Error("Question already added to this assessment");
  }

  // Assessment-এর সাথে Question attach
  const assessmentQuestion = await prisma.assessmentQuestion.create({
    data: {
      assessmentId,
      questionId,
      order,
      marks: marks ?? question.marks,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  return assessmentQuestion;
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
  // Company profile check
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  // Assessment এই company-এর কিনা check
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      companyId: company.id,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  // Assessment published কিনা
  if (assessment.status !== "PUBLISHED") {
    throw new Error("Only published assessment can be sent to candidates");
  }

  // Candidate User আছে কিনা এবং role CANDIDATE কিনা
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

  // আগে invite করা হয়েছে কিনা
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

  // Invitation create
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
export const AssessmentService = {
  createAssessment,
  addQuestionToAssessment,
  publishAssessment,
  inviteCandidate,
};
