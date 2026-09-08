import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { InvitationController } from "./invitation.controller";

const router = Router();

router.get(
  "/my-assigned",
  auth(Role.CANDIDATE),
  InvitationController.getMyInvitations,
);

router.patch(
  "/status/:invitationId",
  auth(Role.CANDIDATE),
  InvitationController.acceptInvitation,
);

router.post(
  "/start/:assessmentId",
  auth(Role.CANDIDATE),
  InvitationController.startAssessment,
);

export const InvitationRoutes = router;
