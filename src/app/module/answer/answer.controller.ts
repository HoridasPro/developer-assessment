import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AnswerServices } from "./answer.service";

const saveAnswer = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id as string;
  const { attemptId } = req.params;

  const result = await AnswerServices.saveAnswer(
    userId,
    attemptId as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    message: "Answer saved successfully",
    data: result,
  });
});

export const AnswerController = {
  saveAnswer,
};
