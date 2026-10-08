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

router.get(
  "/questions/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.getAssessmentQuestions,
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
  "/assessments/search",
  auth(Role.COMPANY),
  AssessmentController.searchAssessments,
);

router.get(
  "/assessments",
  auth(Role.COMPANY),
  AssessmentController.getAllAssessments,
);

router.get(
  "/assessments/archived",
  auth(Role.COMPANY),
  AssessmentController.getArchivedAssessments,
);

router.get(
  "/assessments/:assessmentId",
  auth(Role.COMPANY),
  AssessmentController.getAssessmentById,
);

export const AssessmentRoutes = router;
