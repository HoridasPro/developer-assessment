import { Router } from "express";

import { UserController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.get("/me", auth(Role.CANDIDATE), UserController.getMyProfileDB);

// router.patch(
//   "/me",
//   auth(),
//   UserController.updateMyProfile,
// );

export const UserRoutes = router;
