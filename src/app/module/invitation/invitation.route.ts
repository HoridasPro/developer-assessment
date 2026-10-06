import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { InvitationController } from "./invitation.controller";
import { validateRequest } from "../../middleware/validationRequest";
import { InvitationValidation } from "./invitation.validation";

const router = Router();

router.get(
  "/my-assigned",
  auth(Role.CANDIDATE),
  InvitationController.getMyInvitations,
);

router.post(
  "/:invitationId",
  auth(Role.CANDIDATE),
  InvitationController.cancelInvitation,
);

router.patch(
  "/status/:invitationId",
  validateRequest(InvitationValidation.statusValidationSchema),
  auth(Role.CANDIDATE),
  InvitationController.acceptInvitation,
);

router.post(
  "/start/:assessmentId",
  auth(Role.CANDIDATE),
  InvitationController.startAssessment,
);

export const InvitationRoutes = router;
