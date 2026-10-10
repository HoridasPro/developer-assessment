import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { IUpdateMyProfile } from "./user.interface";
import { uploadToCloudinary } from "../../utils/upload-to-cloudinary";

const getMyProfileDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;

  const result = await UserService.getMyProfile(userId as string);

  sendResponse(res, {
    success: true,
    message: "User profile successfully",
    data: result,
  });
});

// const updateMyProfileDB = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.data?.id;

//   const result = await UserService.updateMyProfile(userId as string, req.body);

//   sendResponse(res, {
//     success: true,
//     message: "User profile updated successfully",
//     data: result,
//   });
// });

const updateMyProfileDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const files = req.files as
    | {
        profilePhoto?: Express.Multer.File[];
        resumeFile?: Express.Multer.File[];
      }
    | undefined;

  // FormData থেকে আসা candidateProfile JSON-কে object বানানো
  // Candidate profile parse
  let candidateProfile = req.body.candidateProfile;

  if (typeof candidateProfile === "string") {
    candidateProfile = JSON.parse(candidateProfile);
  }

  // Company profile parse
  let companyProfile = req.body.companyProfile;

  if (typeof companyProfile === "string") {
    companyProfile = JSON.parse(companyProfile);
  }

  const payload: IUpdateMyProfile = {
    ...req.body,
    ...(candidateProfile !== undefined && { candidateProfile }),
    ...(companyProfile !== undefined && { companyProfile }),
  };

  // Profile photo Cloudinary-তে আপলোড
  const photoFile = files?.profilePhoto?.[0];

  if (photoFile) {
    payload.profilePhoto = await uploadToCloudinary(
      photoFile.buffer,
      "image",
      "dev-assessment/profile-photos",
    );
  }

  // Resume PDF Cloudinary-তে আপলোড
  const resumeFile = files?.resumeFile?.[0];

  if (resumeFile) {
    const resumeUrl = await uploadToCloudinary(
      resumeFile.buffer,
      "raw",
      "dev-assessment/resumes",
    );

    payload.candidateProfile = {
      ...payload.candidateProfile,
      resumeUrl,
    };
  }

  const result = await UserService.updateMyProfile(userId, payload);

  sendResponse(res, {
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

export { updateMyProfileDB };

const getCandidates = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getCandidates();

  sendResponse(res, {
    success: true,
    message: "Candidates retrieved successfully",
    data: result,
  });
});

export const UserController = {
  getMyProfileDB,
  updateMyProfileDB,
  getCandidates,
};
