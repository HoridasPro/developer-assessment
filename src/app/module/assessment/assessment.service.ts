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

export const AssessmentService = {
  createAssessment,
};
