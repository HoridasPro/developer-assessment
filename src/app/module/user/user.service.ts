import { prisma } from "../../lib/prisma";

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      phone: true,
      role: true,
      status: true,
      isActive: true,
    },
  });
  if (!user) {
    throw new Error("User not found in the database");
  }
  if (!user.isActive) {
    throw new Error("User is inactive");
  }
  return user;
};

// const updateMyProfile = async (
//   userId: string,
//   payload: {
//     name?: string;
//     email?: string;
//   },
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
//       ...(payload.name && {
//         name: payload.name,
//       }),

//       ...(payload.email && {
//         email: payload.email,
//       }),
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });

//   return updatedUser;
// };

export const UserService = {
  getMyProfile,
  // updateMyProfile,
};
