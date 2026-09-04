import { Router } from "express";

import { UserController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.get(
  "/me",
  auth(Role.CANDIDATE, Role.COMPANY),
  UserController.getMyProfileDB,
);

router.patch(
  "/me",
  auth(Role.CANDIDATE, Role.COMPANY),
  UserController.updateMyProfileDB,
);

export const UserRoutes = router;
