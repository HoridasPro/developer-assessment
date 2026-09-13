import { NextFunction, type Request, type Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerUserControllerDB = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerUser(payload);

    sendResponse(res, {
      success: true,
      message: "Register is successfully",
      data: result,
    });
  },
);

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { accessToken, refreshToken } = await AuthService.userLogin(payload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    success: true,
    message: "User login successfully",
    data: { accessToken, refreshToken },
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.googleLogin(req.body);

  const { accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
  });

  res.cookie("refreshToken", refreshToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
  });

  sendResponse(res, {
    success: true,
    message: "Google login successful!",
    data: { accessToken, refreshToken },
  });
});
const refreshTokenDB = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    success: true,
    message: "Access token refreshed successfully",
    data: result,
  });
});
export const AuthController = {
  registerUserControllerDB,
  userLogin,
  googleLogin,
  refreshTokenDB,
};
