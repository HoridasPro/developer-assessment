import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { InvitationServices } from "./invitation.service";

const getMyInvitations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id as string;

  const result = await InvitationServices.getMyInvitations(userId);

  sendResponse(res, {
    success: true,
    message: "Invitations fetched successfully",
    data: result,
  });
});

const cancelInvitation = catchAsync(
  async (req: Request, res: Response) => {
    const { invitationId } = req.params;
    const userId = req.data?.id;

    if (!userId) {
      throw new Error("User not logged in");
    }

    const result =
      await InvitationServices.cancelInvitation(
        invitationId as string,
        userId,
      );

    sendResponse(res, {
      success: true,
      message: "Invitation cancelled successfully",
      data: result,
    });
  },
);

const acceptInvitation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id as string;

  const { invitationId } = req.params;

  const result = await InvitationServices.acceptInvitation(
    userId,
    invitationId as string,
  );

  sendResponse(res, {
    success: true,
    message: "Invitation accepted successfully",
    data: result,
  });
});

const startAssessment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.data?.id as string;
  const { assessmentId } = req.params;

  const result = await InvitationServices.startAssessment(
    userId,
    assessmentId as string,
  );

  sendResponse(res, {
    success: true,
    message: "Assessment started successfully",
    data: result,
  });
});

export const InvitationController = {
  getMyInvitations,
  cancelInvitation,
  acceptInvitation,
  startAssessment,
};
