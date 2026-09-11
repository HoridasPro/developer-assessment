import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { AssessmentController } from "./assessment.controller";
import { validateRequest } from "../../middleware/validationRequest";
import { AssessmentValidation } from "./assessment.validation";

const router = Router();

router.post(
  "/assessments",
  validateRequest(AssessmentValidation.createAssessmentValidationSchema),
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
  validateRequest(
    AssessmentValidation.addQuestionsToAssessmentValidationSchema,
  ),
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
  validateRequest(AssessmentValidation.inviteCandidateValidationSchema),
  auth(Role.COMPANY),
  AssessmentController.inviteCandidate,
);

router.get(
  "/search/assessments",
  auth(Role.COMPANY),
  AssessmentController.searchAssessments,
);

router.get(
  "/assessments",
  auth(Role.COMPANY),
  AssessmentController.getAllAssessments,
);

router.get(
  "/assessments/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.getAssessmentById,
);

export const AssessmentRoutes = router;
