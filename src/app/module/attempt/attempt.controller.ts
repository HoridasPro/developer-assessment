import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AttemptServices } from "./attempt.service";

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

const submitAttempt = catchAsync(async (req: Request, res: Response) => {
  const { attemptId } = req.params;

  const candidateId = req.data?.id;

  if (!candidateId) {
    throw new Error("User not logged in");
  }

  // Call service
  const result = await AttemptServices.submitAttempt(
    attemptId as string,
    candidateId,
  );

  // Response
  sendResponse(res, {
    success: true,
    message: "Assessment submitted successfully",
    data: result,
  });
});

const evaluateAttempt = catchAsync(async (req: Request, res: Response) => {
  const { attemptId } = req.params;

  const candidateId = req.data?.id;

  if (!candidateId) {
    throw new Error("User not logged in");
  }

  const result = await AttemptServices.evaluateAttempt(
    attemptId as string,
    candidateId,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment evaluated successfully",
    data: result,
  });
});

export const AttemptController = {
  getAttemptQuestions,
  submitAttempt,
  evaluateAttempt,
};
