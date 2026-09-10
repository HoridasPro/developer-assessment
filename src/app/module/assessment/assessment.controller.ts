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
const deleteAssessment = catchAsync(async (req: Request, res: Response) => {
  const { assessmentId } = req.params;

  const companyUserId = req.data?.id;

  if (!companyUserId) {
    throw new Error("User not logged in");
  }

  const result = await AssessmentService.deleteAssessment(
    assessmentId as string,
    companyUserId,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment deleted successfully",
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

    const { options } = req.body;

    if (!options || !Array.isArray(options) || options.length === 0) {
      throw new Error("Please provide an array of questions in options");
    }

    const result = await AssessmentService.addQuestionsToAssessment(
      userId,
      assessmentId,
      options,
    );

    sendResponse(res, {
      success: true,
      message: "Questions added to assessment successfully",
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

const inviteCandidate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;

  const { assessmentId } = req.params;

  const { candidateUserId } = req.body;

  if (!userId) {
    throw new Error("User not found");
  }

  const result = await AssessmentService.inviteCandidate(
    userId,
    assessmentId as string,
    candidateUserId,
  );

  sendResponse(res, {
    success: true,
    message: "Candidate invited successfully",
    data: result,
  });
});

const searchAssessments = catchAsync(async (req: Request, res: Response) => {
  const companyUserId = req.data?.id;
  const { q } = req.query;

  if (!companyUserId) {
    throw new Error("User not logged in");
  }

  if (!q || typeof q !== "string") {
    throw new Error("Search keyword is required");
  }

  const result = await AssessmentService.searchAssessments(companyUserId, q);

  sendResponse(res, {
    success: true,
    message: "Assessments searched successfully",
    data: result,
  });
});

const getAllAssessments = catchAsync(async (req: Request, res: Response) => {
  const companyUserId = req.data?.id;

  if (!companyUserId) {
    throw new Error("User not logged in");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;

  const result = await AssessmentService.getAllAssessments(
    companyUserId,
    page,
    limit,
    status,
  );

  sendResponse(res, {
    success: true,
    message: "Assessments fetched successfully",
    data: result,
  });
});

const getAssessmentById = catchAsync(async (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const companyUserId = req.data?.id;

  if (!companyUserId) {
    throw new Error("User not logged in");
  }

  const result = await AssessmentService.getAssessmentById(
    assessmentId as string,
    companyUserId,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment fetched successfully",
    data: result,
  });
});

export const AssessmentController = {
  createAssessmentDB,
  deleteAssessment,
  addQuestionToAssessmentDB,
  publishAssessment,
  inviteCandidate,
  searchAssessments,
  getAllAssessments,
  getAssessmentById,
};
