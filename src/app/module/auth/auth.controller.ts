import { NextFunction, Request, Response } from "express";
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

const userLoginDB = catchAsync(async (req: Request, res: Response) => {
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

// const refreshToken = catchAsync(
//   async (req: Request, res: Response) => {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       throw new Error("Refresh token is required");
//     }

//     const result = await AuthService.(refreshToken);

//     res.status(200).json({
//       success: true,
//       message: "Access token refreshed successfully",
//       data: result,
//     });
//   },
// );
 

export const AuthController = {
  registerUserControllerDB,
  userLoginDB,
};
