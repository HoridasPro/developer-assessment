/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IUserLoginPayload, IUserRegisterPayload } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { SignOptions } from "jsonwebtoken";
import { Role } from "../../../../generated/prisma/enums";

// User Register
const registerUser = async (payload: IUserRegisterPayload) => {
  const { name, password, profilePhoto, role, isActive, phone } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
    omit: {
      password: true,
    },
  });

  if (role !== Role.CANDIDATE) {
    throw new Error("Only candidate can register");
  }

  if (isUserExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profilePhoto,
      phone,
      role,
      isActive,
    },
  });
  const result = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    profilePhoto: newUser.profilePhoto,
    role: newUser.role,
    isActive: newUser.isActive,
    phone: newUser.phone,
  };

  return result;
};

const userLogin = async (payload: IUserLoginPayload) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password is not matched");
  }
  const jwt_access_secret = config.jwt_access_secret;
  const jwt_refresh_secret = config.jwt_refresh_secret;

  if (!jwt_access_secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }
  if (!jwt_refresh_secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  // accesstoken
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  // refresh token
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// const refreshToken = async (token: string) => {
//   // 1. Refresh token verify
//   if (!config.jwt_refresh_secret) {
//     throw new Error("JWT refrehs secret is not defined");
//   }
//   const verifiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

//   if (!verifiedToken.success) {
//     throw new Error("Invalid or expired refresh token");
//   }

//   // 2. Token payload
//   const payload = verifiedToken.data as {
//     id: string;
//     email: string;
//     role: Role;
//   };

//   // 3. User check
//   const user = await prisma.user.findUnique({
//     where: {
//       id: payload.id,
//     },
//   });

//   if (!user) {
//     throw new Error("User not found");
//   }

//   // 4. User active check
//   if (!user.isActive) {
//     throw new Error("User account is inactive");
//   }
//   if (!config.jwt_access_secret) {
//     throw new Error("JWT refrehs secret is not defined");
//   }

//   // 5. New access token
//   const accessToken = jwtUtils.createToken(
//     {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     },
//     config.jwt_access_secret,
//     config.jwt_access_expires_in as SignOptions,
//   );

//   return {
//     accessToken,
//   };
// };

export const AuthService = {
  registerUser,
  userLogin,
  // refreshToken,
};
