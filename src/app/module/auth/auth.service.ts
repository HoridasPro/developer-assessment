/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
// import bcrypt from "bcryptjs";

import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import type { IUserLoginPayload, IUserRegisterPayload } from "./auth.interface";
import type { SignOptions } from "jsonwebtoken";
import { googleClient } from "../../lib/googleAuth";
import { Role } from "../../../../generated/prisma/enums";

import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import {
  sendLoginOtpEmail,
  sendVerificationOtpEmail,
  sendWelcomeEmail,
} from "../../utils/sendEmail";

const registerUser = async (payload: IUserRegisterPayload) => {
  const { name, password, profilePhoto, role, status, isActive } = payload;

  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
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

  const verificationOtp = randomInt(100000, 1000000).toString();

  const verificationOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  console.log("VERIFICATION OTP:", verificationOtp);

  console.log("VERIFICATION OTP EXPIRY:", verificationOtpExpiry);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profilePhoto,
      role,
      status,
      isActive,

      emailVerified: false,
      verificationOtp,
      verificationOtpExpiry,
    },
  });

  await sendVerificationOtpEmail(newUser.email, newUser.name, verificationOtp);

  const result = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    profilePhoto: newUser.profilePhoto,
    role: newUser.role,
    status: newUser.status,
    isActive: newUser.isActive,
    emailVerified: newUser.emailVerified,
  };

  return result;
};

const verifyEmailOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    throw new Error("Email is already verified");
  }

  if (!user.verificationOtp || !user.verificationOtpExpiry) {
    throw new Error("Verification OTP not found");
  }

  if (user.verificationOtpExpiry < new Date()) {
    throw new Error("Verification OTP has expired");
  }

  if (user.verificationOtp !== otp) {
    throw new Error("Invalid verification OTP");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
      verificationOtp: null,
      verificationOtpExpiry: null,
    },
  });

  await sendWelcomeEmail(updatedUser.email, updatedUser.name);

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    emailVerified: updatedUser.emailVerified,
  };
};

const userLogin = async (payload: IUserLoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status === "SUSPENDED") {
    throw new Error("Your account has been suspended");
  }

  if (!user.password) {
    throw new Error("Invalid credentials or account uses social login.");
  }

  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password is not matched");
  }

  const otp = randomInt(100000, 1000000).toString();

  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      loginOtp: otp,
      loginOtpExpiry: otpExpiry,
    },
  });

  await sendLoginOtpEmail(user.email, user.name, otp);

  return {
    email: user.email,
    message: "Login OTP sent to your email",
  };
};

const verifyLoginOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "SUSPENDED") {
    throw new Error("Your account has been suspended");
  }

  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in");
  }

  if (!user.loginOtp || !user.loginOtpExpiry) {
    throw new Error("Login OTP not found");
  }

  if (user.loginOtpExpiry < new Date()) {
    throw new Error("Login OTP has expired");
  }

  // Check OTP
  if (user.loginOtp !== otp) {
    throw new Error("Invalid login OTP");
  }

  const jwt_access_secret = config.jwt_access_secret;
  const jwt_refresh_secret = config.jwt_refresh_secret;

  if (!jwt_access_secret) {
    throw new Error("Jwt access secret is not defined");
  }

  if (!jwt_refresh_secret) {
    throw new Error("Jwt refresh secret is not defined");
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Access token
  const accessToken = jwtUtils.createToken(jwtPayload, jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in as SignOptions["expiresIn"],
  });

  // Refresh token
  const refreshToken = jwtUtils.createToken(jwtPayload, jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      loginOtp: null,
      loginOtpExpiry: null,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const googleLogin = async (payload: { idToken: string; role?: string }) => {
  const { idToken, role } = payload;

  if (!idToken) {
    throw new Error("Token is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google_client_id,
  });

  const googleUser = ticket.getPayload();

  if (!googleUser || !googleUser.email) {
    throw new Error("Invalid Google Token");
  }

  let user = await prisma.user.findUnique({
    where: {
      email: googleUser.email,
    },
  });

  if (!user) {
    let assignedRole: Role = Role.CANDIDATE;

    if (role === "COMPANY" || role === Role.COMPANY) {
      assignedRole = Role.COMPANY;
    } else if (role === "CANDIDATE" || role === Role.CANDIDATE) {
      assignedRole = Role.CANDIDATE;
    }

    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name as string,
        profilePhoto: googleUser.picture || "",
        authProvider: "GOOGLE",
        googleId: googleUser.sub,
        role: assignedRole,
      },
    });
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expires_in } as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expires_in } as SignOptions,
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  if (!config.jwt_refresh_secret) {
    throw new Error("JWT refresh secret is not defined");
  }

  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verifiedToken.success) {
    throw new Error("Invalid or expired refresh token");
  }

  const payload = verifiedToken.data as {
    id?: string;
    userId?: string;
    email: string;
    role: Role;
  };

  const userId = payload.id || payload.userId;

  if (!userId) {
    throw new Error("Invalid token payload: User ID missing");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
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
  verifyEmailOtp,
  userLogin,
  verifyLoginOtp,
  refreshToken,
  googleLogin,
};
