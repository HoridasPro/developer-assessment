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

router.delete(
  "/assessment/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.deleteAssessment,
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
  "/asign/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.inviteCandidate,
);

router.get(
  "/search/assessments",
  auth(Role.COMPANY),
  AssessmentController.searchAssessments,
);

export const AssessmentRoutes = router;
