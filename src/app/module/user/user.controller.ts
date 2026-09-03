import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";

const getMyProfileDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const result = await UserService.getMyProfile(userId);
  sendResponse(res, {
    success: true,
    message: "My profile retrieved successfully",
    data: result,
  });
});

// const updateMyProfile = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.data?.id;

//     if (!userId) {
//       throw new Error("User not authenticated");
//     }

//     const result = await UserService.updateMyProfile(
//       userId,
//       req.body,
//     );

//     res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       data: result,
//     });
//   },
// );

export const UserController = {
  getMyProfileDB,
  // updateMyProfile,
};
