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

const evaluateAttempt = catchAsync(async (req: Request, res: Response) => {
  const { attemptId } = req.params;

  const companyId = req.data?.id;

  if (!companyId) {
    throw new Error("User not logged in");
  }

  const result = await AttemptServices.evaluateAttempt(
    attemptId as string,
    companyId,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment evaluated successfully",
    data: result,
  });
});

const getAttemptResult = catchAsync(async (req: Request, res: Response) => {
  const { attemptId } = req.params;

  const candidateId = req.data?.id;

  if (!candidateId) {
    throw new Error("User not logged in");
  }

  const result = await AttemptServices.getAttemptResult(
    attemptId as string,
    candidateId,
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

export const AttemptController = {
  getAttemptQuestions,
  cancelAttempt,
  submitAttempt,
  evaluateAttempt,
  getAttemptResult,
  getAllMyAssessmentResults,
};
