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
router.post(
  "/questions/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.addQuestionToAssessmentDB,
);

router.patch(
  "/publish/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.publishAssessment,
);

router.post(
  "/invite/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.inviteCandidate,
);

export const AssessmentRoutes = router;
