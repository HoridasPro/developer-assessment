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

  res.status(201).json({
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

// const updateQuestion = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.data?.id;

//   if (!userId) {
//     throw new Error("User not authenticated");
//   }

//   const { questionId } = req.params;
//   console.log("questionId get:", questionId);

//   if (Array.isArray(questionId)) {
//     throw new Error("Invalid question ID");
//   }

//   const result = await QuestionService.updateQuestion(
//     userId,
//     questionId,
//     req.body,
//   );

//   sendResponse(res, {
//     success: true,
//     message: "Question updated successfully",
//     data: result,
//   });
// });

export const QuestionController = {
  createQuestions,
  getAllQuestions,
  getQuestionById,
  deleteQuestion,
  // updateQuestion,
};
