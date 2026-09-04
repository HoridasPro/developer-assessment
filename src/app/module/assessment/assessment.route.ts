import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { AssessmentController } from "./assessment.controller";

const router = Router();

router.post(
  "/assessments",
  auth(Role.COMPANY),
  AssessmentController.createAssessmentDB,
);

export const AssessmentRoutes = router;
