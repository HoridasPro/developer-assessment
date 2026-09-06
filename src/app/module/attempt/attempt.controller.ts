import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AttemptServices } from "./attempt.service";

const getAttemptQuestions = catchAsync(
  async (req: Request, res: Response) => {
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
  },
);

export const AttemptController = {
  getAttemptQuestions,
};