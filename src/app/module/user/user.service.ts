import { prisma } from "../../lib/prisma";
import { IUpdateMyProfile } from "./user.interface";

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "CANDIDATE") {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    return {
      ...user,
      candidateProfile,
    };
  }

  if (user.role === "COMPANY") {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    return {
      ...user,
      companyProfile,
    };
  }

  throw new Error("Invalid user role");
};

const updateMyProfile = async (userId: string, payload: IUpdateMyProfile) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (payload.name !== undefined || payload.profilePhoto !== undefined) {
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        ...(payload.name !== undefined && {
          name: payload.name,
        }),

        ...(payload.profilePhoto !== undefined && {
          profilePhoto: payload.profilePhoto,
        }),
      },
    });
  }

  if (user.role === "CANDIDATE") {
    if (payload.companyProfile !== undefined) {
      throw new Error("Candidate cannot update company profile");
    }

    if (payload.candidateProfile !== undefined) {
      const cp = payload.candidateProfile;

      await prisma.candidateProfile.upsert({
        where: {
          userId: userId,
        },

        create: {
          userId: userId,
          bio: cp.bio ?? null,
          phone: cp.phone ?? null,
          location: cp.location ?? null,
          skills: cp.skills ?? [],
          experience: cp.experience ?? null,
          education: cp.education ?? null,
          resumeUrl: cp.resumeUrl ?? null,
          portfolioUrl: cp.portfolioUrl ?? null,
          githubUrl: cp.githubUrl ?? null,
          linkedinUrl: cp.linkedinUrl ?? null,
        },

        update: {
          ...(cp.bio !== undefined && {
            bio: cp.bio,
          }),

          ...(cp.phone !== undefined && {
            phone: cp.phone,
          }),

          ...(cp.location !== undefined && {
            location: cp.location,
          }),

          ...(cp.skills !== undefined && {
            skills: cp.skills,
          }),

          ...(cp.experience !== undefined && {
            experience: cp.experience,
          }),

          ...(cp.education !== undefined && {
            education: cp.education,
          }),

          ...(cp.resumeUrl !== undefined && {
            resumeUrl: cp.resumeUrl,
          }),

          ...(cp.portfolioUrl !== undefined && {
            portfolioUrl: cp.portfolioUrl,
          }),

          ...(cp.githubUrl !== undefined && {
            githubUrl: cp.githubUrl,
          }),

          ...(cp.linkedinUrl !== undefined && {
            linkedinUrl: cp.linkedinUrl,
          }),
        },
      });
    }
  }
  if (payload.name !== undefined || payload.profilePhoto !== undefined) {
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        ...(payload.name !== undefined && {
          name: payload.name,
        }),

        ...(payload.profilePhoto !== undefined && {
          profilePhoto: payload.profilePhoto,
        }),
      },
    });
  }

  if (user.role === "COMPANY") {
    if (payload.candidateProfile !== undefined) {
      throw new Error("Company cannot update candidate profile");
    }

    if (payload.companyProfile !== undefined) {
      const comp = payload.companyProfile;

      await prisma.companyProfile.upsert({
        where: {
          userId: userId,
        },

        create: {
          userId: userId,

          companyName: comp.companyName ?? "",

          description: comp.description ?? null,
          website: comp.website ?? null,
        },

        update: {
          ...(comp.companyName !== undefined && {
            companyName: comp.companyName,
          }),

          ...(comp.description !== undefined && {
            description: comp.description,
          }),

          ...(comp.website !== undefined && {
            website: comp.website,
          }),
        },
      });
    }
  }

  return await getMyProfile(userId);
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
};
