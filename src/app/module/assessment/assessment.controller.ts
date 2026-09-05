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

const addQuestionToAssessmentDB = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.data?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { assessmentId } = req.params;
    if (Array.isArray(assessmentId)) {
      throw new Error("Invalid assessment ID");
    }

    const { questionId, order, marks } = req.body;

    const result = await AssessmentService.addQuestionToAssessment(
      userId,
      assessmentId,
      questionId,
      order,
      marks,
    );

    res.status(201).json({
      success: true,
      message: "Question added to assessment successfully",
      data: result,
    });
  },
);

const publishAssessment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id as string;
  const { assessmentId } = req.params;

  const result = await AssessmentService.publishAssessment(
    userId,
    assessmentId as string,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment published successfully",
    data: result,
  });
});

export const AssessmentController = {
  createAssessmentDB,
  addQuestionToAssessmentDB,
  publishAssessment,
};
