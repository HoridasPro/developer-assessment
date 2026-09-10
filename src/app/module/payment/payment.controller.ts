import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id;

  const { assessmentId } = req.body;

  const result = await PaymentService.initiatePayment(
    userId as string,
    assessmentId,
  );

  sendResponse(res, {
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const result = await PaymentService.handleWebhook(sessionId);

  sendResponse(res, {
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  handleWebhook,
};
