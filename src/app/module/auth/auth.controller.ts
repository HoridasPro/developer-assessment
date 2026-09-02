import { Request, Response } from "express";
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

export const AuthController = {
  registerUserControllerDB,
};
