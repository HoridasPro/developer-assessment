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

// const acceptInvitation = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.data?.id as string;

//     const { invitationId } = req.params;

//     const result =
//       await CandidateAssessmentService.acceptInvitation(
//         userId,
//         invitationId,
//       );

//     sendResponse(res, {
//       success: true,
//       message: "Invitation accepted successfully",
//       data: result,
//     });
//   },
// );

export const InvitationController = {
  getMyInvitations,
  // acceptInvitation,
};
