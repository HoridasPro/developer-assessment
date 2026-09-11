import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { QuestionService } from "./question.service";
import { sendResponse } from "../../utils/sendResponse";

const createQuestions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const result = await QuestionService.createQuestions(
    userId,
    req.body.questions,
  );

  sendResponse(res, {
    success: true,
    message: "Questions created successfully",
    data: result,
  });
});
const getAllQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.getAllQuestions();

  sendResponse(res, {
    success: true,
    message: "Questions fetched successfully",
    data: result,
  });
});

const getQuestionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await QuestionService.getQuestionById(id as string);

  sendResponse(res, {
    success: true,
    message: "Question fetched successfully",
    data: result,
  });
});

const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await QuestionService.deleteQuestion(id as string);

  sendResponse(res, {
    success: true,
    message: "Question deleted successfully",
    data: null,
  });
});

const bulkUpdateQuestions = async (req: Request, res: Response) => {
  const result = await QuestionService.bulkUpdateQuestions(
    req.data?.id as string,
    req.body.questions,
  );

  sendResponse(res, {
    success: true,
    message: "Questions updated successfully",
    data: result,
  });
};
export const QuestionController = {
  createQuestions,
  getAllQuestions,
  getQuestionById,
  deleteQuestion,
  bulkUpdateQuestions,
};
