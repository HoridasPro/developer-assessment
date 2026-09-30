import { NextFunction, type Request, type Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import config from "../../config";

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
const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      message: "Verification token is required",
    });
  }

  const result = await AuthService.verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: result,
  });
};

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { accessToken, refreshToken } = await AuthService.userLogin(payload);
  const isDevelopment = config.node_env === "development";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isDevelopment ? false : true,
    sameSite: isDevelopment ? "lax" : "none",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isDevelopment ? false : true,
    sameSite: isDevelopment ? "lax" : "none",
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
  const isDevelopment = config.node_env === "development";

  res.cookie("accessToken", accessToken, {
    secure: isDevelopment ? false : true,
    sameSite: isDevelopment ? "lax" : "none",
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    secure: isDevelopment ? false : true,
    sameSite: isDevelopment ? "lax" : "none",
    httpOnly: true,
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

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    success: true,
    message: "Logout successfully",
    data: null,
  });
});

export const AuthController = {
  registerUserControllerDB,
  verifyEmail,
  userLogin,
  googleLogin,
  refreshTokenDB,
  logout,
};
