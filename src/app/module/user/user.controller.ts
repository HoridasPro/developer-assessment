import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";

const getMyProfileDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;

  const result = await UserService.getMyProfile(userId as string);

  sendResponse(res, {
    success: true,
    message: "User profile successfully",
    data: result,
  });
});

 
const updateMyProfileDB = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.data?.id;

    const result = await UserService.updateMyProfile(
      userId as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      message: "User profile updated successfully",
      data: result,
    });
  },
);

export const UserController = {
  getMyProfileDB,
  updateMyProfileDB
};
