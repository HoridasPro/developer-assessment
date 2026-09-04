import { prisma } from "../../lib/prisma";
import { ICandidateProfile } from "./user.interface";

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    // include: {
    //   candidateProfile: true,
    // },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
const updateMyProfile = async (userId: string, payload: ICandidateProfile) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      ...(payload.name !== undefined && {
        name: payload.name,
      }),

      // CandidateProfile table
      ...(payload.candidateProfile && {
        candidateProfile: {
          upsert: {
            create: {
              bio: payload.candidateProfile.bio,
              phone: payload.candidateProfile.phone,
              location: payload.candidateProfile.location,
              skills: payload.candidateProfile.skills ?? [],
              experience: payload.candidateProfile.experience,
              education: payload.candidateProfile.education,
              resumeUrl: payload.candidateProfile.resumeUrl,
              portfolioUrl: payload.candidateProfile.portfolioUrl,
              githubUrl: payload.candidateProfile.githubUrl,
              linkedinUrl: payload.candidateProfile.linkedinUrl,
            },

            update: {
              ...(payload.candidateProfile.bio !== undefined && {
                bio: payload.candidateProfile.bio,
              }),

              ...(payload.candidateProfile.phone !== undefined && {
                phone: payload.candidateProfile.phone,
              }),

              ...(payload.candidateProfile.location !== undefined && {
                location: payload.candidateProfile.location,
              }),

              ...(payload.candidateProfile.skills !== undefined && {
                skills: payload.candidateProfile.skills,
              }),

              ...(payload.candidateProfile.experience !== undefined && {
                experience: payload.candidateProfile.experience,
              }),

              ...(payload.candidateProfile.education !== undefined && {
                education: payload.candidateProfile.education,
              }),

              ...(payload.candidateProfile.resumeUrl !== undefined && {
                resumeUrl: payload.candidateProfile.resumeUrl,
              }),

              ...(payload.candidateProfile.portfolioUrl !== undefined && {
                portfolioUrl: payload.candidateProfile.portfolioUrl,
              }),

              ...(payload.candidateProfile.githubUrl !== undefined && {
                githubUrl: payload.candidateProfile.githubUrl,
              }),

              ...(payload.candidateProfile.linkedinUrl !== undefined && {
                linkedinUrl: payload.candidateProfile.linkedinUrl,
              }),
            },
          },
        },
      }),
    },

    include: {
      candidateProfile: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
};
