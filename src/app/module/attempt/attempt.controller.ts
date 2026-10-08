/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AttemptServices } from "./attempt.service";
import { prisma } from "../../lib/prisma";

const getAttemptQuestions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id as string;
  const { attemptId } = req.params;

  const result = await AttemptServices.getAttemptQuestions(
    userId,
    attemptId as string,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment questions fetched successfully",
    data: result,
  });
});

const cancelAttempt = catchAsync(async (req: Request, res: Response) => {
  const { attemptId } = req.params;

  const candidateId = req.data?.id;

  if (!candidateId) {
    throw new Error("User not logged in");
  }

  const result = await AttemptServices.cancelAttempt(
    attemptId as string,
    candidateId,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment attempt cancelled successfully",
    data: result,
  });
});

const submitAttempt = catchAsync(async (req: Request, res: Response) => {
  const { attemptId } = req.params;

  const candidateId = req.data?.id;

  if (!candidateId) {
    throw new Error("User not logged in");
  }

  const result = await AttemptServices.submitAttempt(
    attemptId as string,
    candidateId,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment submitted successfully",
    data: result,
  });
});

// const evaluateAttempt = catchAsync(async (req: Request, res: Response) => {
//   const { attemptId } = req.params;

//   const companyId = req.data?.id;

//   if (!companyId) {
//     throw new Error("User not logged in");
//   }

//   const result = await AttemptServices.evaluateAttempt(
//     attemptId as string,
//     companyId,
//   );

//   sendResponse(res, {
//     success: true,
//     message: "Assessment evaluated successfully",
//     data: result,
//   });
// });

const evaluateAttempt = catchAsync(async (req: Request, res: Response) => {
  const { attemptId } = req.params;
  const companyId = (req as any).data?.id;

  // 1. req.body.answers অথবা req.body.payload.answers দুটোই নিরাপদে চেক করুন
  const answers = req.body?.answers || req.body?.payload?.answers;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error("Answers array is required in request body");
  }

  // 2. সার্ভিস ফাংশনে ৩টি Argument পাস করুন
  const result = await AttemptServices.evaluateAttempt(
    attemptId as string,
    companyId,
    answers,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment evaluated successfully",
    data: result,
  });
});
// const getAttemptResult = catchAsync(async (req: Request, res: Response) => {
//   const { attemptId } = req.params;

//   const candidateId = req.data?.id;

//   if (!candidateId) {
//     throw new Error("User not logged in");
//   }

//   const result = await AttemptServices.getAttemptResult(
//     attemptId as string,
//     candidateId,
//   );

//   sendResponse(res, {
//     success: true,
//     message: "Assessment result fetched successfully",
//     data: result,
//   });
// });

const getAttemptResult = catchAsync(async (req: Request, res: Response) => {
  const candidateUserId = req.data?.id as string;

  const { attemptId } = req.params;

  const result = await AttemptServices.getAttemptResult(
    candidateUserId,
    attemptId as string,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment result fetched successfully",
    data: result,
  });
});
const getAllMyAssessmentResults = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.data?.id;

    if (!candidateId) {
      throw new Error("User not logged in");
    }

    const result = await AttemptServices.getAllMyAssessmentResults(candidateId);

    sendResponse(res, {
      success: true,
      message: "Assessment history fetched successfully",
      data: result,
    });
  },
);

// const getAttemptDetailsForCompany = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = req.data?.id as string;

//     const { attemptId } = req.params;

//     const result = await AttemptServices.getAttemptDetailsForCompany(
//       companyId,
//       attemptId as string,
//     );

//     sendResponse(res, {
//       success: true,
//       message: "Attempt details fetched successfully",
//       data: result,
//     });
//   },
// );

// const getCompanyAttempts = catchAsync(
//   async (req: Request, res: Response) => {
//     const companyId = req.data?.id as string;

//     const result =
//       await AttemptServices.getCompanyAttempts(companyId);

//     sendResponse(res, {
//       success: true,
//       message: "Company attempts fetched successfully",
//       data: result,
//     });
//   },
// );

export const getAttemptDetailsForCompany = catchAsync(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.data?.id;

  // ১. ইউজার ID দিয়ে Company Profile বের করুন
  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: userId },
  });

  // ২. প্রোফাইল থাকলে তার ID (6a8f912b...), না থাকলে userId
  const companyId = companyProfile ? companyProfile.id : userId;

  // ৩. সার্ভিস কল করুন
  const result = await AttemptServices.getAttemptDetailsForCompany(
    companyId as any,
    attemptId as any,
  );

  sendResponse(res, {
    success: true,
    message: "Attempt details fetched successfully",
    data: result,
  });
});
export const getCompanyAttempts = async (req: Request, res: Response) => {
  try {
    // req.user থেকে user ID নিয়ে company profile এর ID খুঁজে বের করা
    const userId = req.data?.id;

    // ১. প্রথমে এই User-এর Company Profile খুঁজুন
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: userId },
    });

    // ২. Company Profile-এর ID বা User ID যেটা মেলে সেটা দিয়ে সার্ভিস কল করুন
    const targetCompanyId = companyProfile ? companyProfile.id : userId;

    console.log("Searching attempts for Company ID:", targetCompanyId);

    const result = await AttemptServices.getCompanyAttempts(
      targetCompanyId as any,
    );

    return res.status(200).json({
      success: true,
      message: "Company attempts fetched successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attempts",
    });
  }
};

export const AttemptController = {
  getAttemptQuestions,
  cancelAttempt,
  submitAttempt,
  evaluateAttempt,
  getAttemptResult,
  getAllMyAssessmentResults,
  getAttemptDetailsForCompany,
  getCompanyAttempts,
};
