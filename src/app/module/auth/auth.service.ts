/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { IUserLoginPayload, IUserRegisterPayload } from "./auth.interface";
import { SignOptions } from "jsonwebtoken";
import { Role } from "../../../../generated/prisma/enums";

const registerUser = async (payload: IUserRegisterPayload) => {
  const { name, password, profilePhoto, role, status, isActive } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
    omit: {
      password: true,
    },
  });

  if (role !== Role.CANDIDATE && role !== Role.COMPANY) {
    throw new Error("Only candidate and company can register");
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
      role,
      status,
      isActive,
      // accountStatus,
    },
  });
  const result = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    profilePhoto: newUser.profilePhoto,
    role: newUser.role,
    status: newUser.status,
    isActive: newUser.isActive,
  };

  return result;
};

const userLogin = async (payload: IUserLoginPayload) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  if (user.status === "SUSPENDED") {
    throw new Error("Your account has been suspended");
  }

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
    throw new Error("JWT_refresh_SECRET is not defined");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    // AccountStatus: user.accountStatus,
  };
  // accesstoken
  const accessToken = jwtUtils.createToken(jwtPayload, jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in as SignOptions["expiresIn"],
  });

  // refresh token
  const refreshToken = jwtUtils.createToken(jwtPayload, jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  });

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  if (!config.jwt_refresh_secret) {
    throw new Error("JWT refrehs secret is not defined");
  }
  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verifiedToken.success) {
    throw new Error("Invalid or expired refresh token");
  }

  const payload = verifiedToken.data as {
    id: string;
    email: string;
    role: Role;
  };

  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }
  if (!config.jwt_access_secret) {
    throw new Error("JWT access secret is not defined");
  }
  const accessToken = jwtUtils.createToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    {
      expiresIn: config.jwt_access_expires_in as SignOptions["expiresIn"],
    },
  );
  return {
    accessToken,
  };
};

export const AuthService = {
  registerUser,
  userLogin,
  refreshToken,
};
