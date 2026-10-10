import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";
import { upload } from "../../../middlewares/upload";
import { UserController } from "./user.controller";
// import { validateRequest } from "../../middleware/validationRequest";
// import { UserValidation } from "./user.validation";

const router = Router();

router.get(
  "/me",
  auth(Role.CANDIDATE, Role.COMPANY, Role.ADMIN),
  UserController.getMyProfileDB,
);

// router.patch(
//   "/me",
//   // validateRequest(UserValidation.updateCandidateProfileValidationSchema),
//   // validateRequest(UserValidation.updateCompanyProfileValidationSchema),
//   auth(Role.CANDIDATE, Role.COMPANY),
//   UserController.updateMyProfileDB,
// );

router.patch(
  "/me",
  auth(Role.CANDIDATE, Role.COMPANY),
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resumeFile", maxCount: 1 },
  ]),
  UserController.updateMyProfileDB,
);

router.get(
  "/candidates",
  auth(Role.CANDIDATE, Role.COMPANY),
  UserController.getCandidates,
);

export const UserRoutes = router;
