import type { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import { AssessmentService } from "./assessment.service";

const createAssessmentDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;

  const result = await AssessmentService.createAssessment(
    userId as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment created successfully",
    data: result,
  });
});

export const AssessmentController = {
  createAssessmentDB,
};
