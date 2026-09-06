import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { InvitationController } from "./invitaion.interface";

const router = Router();

router.get(
  "/my-assigned",
  auth(Role.CANDIDATE),
  InvitationController.getMyInvitations,
);

// router.patch(
//   "/invitations/:invitationId/accept",
//   auth(Role.CANDIDATE),

// );

export const InvitationRoutes = router;
