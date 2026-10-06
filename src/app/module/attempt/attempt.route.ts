import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { AttemptController } from "./attempt.controller";

const router = Router();

router.get(
  "/questions/:attemptId",
  auth(Role.CANDIDATE),
  AttemptController.getAttemptQuestions,
);

router.patch(
  "/cancel/:attemptId",
  auth(Role.CANDIDATE),
  AttemptController.cancelAttempt,
);

router.post(
  "/submit/:attemptId",
  auth(Role.CANDIDATE),
  AttemptController.submitAttempt,
);
router.post(
  "/evaluate/:attemptId",
  auth(Role.COMPANY),
  AttemptController.evaluateAttempt,
);
router.get(
  "/result/:attemptId",
  auth(Role.CANDIDATE),
  AttemptController.getAttemptResult,
);

router.get(
  "/my-results",
  auth(Role.CANDIDATE),
  AttemptController.getAllMyAssessmentResults,
);

router.get(
  "/:attemptId",
  auth(Role.COMPANY),
  AttemptController.getAttemptDetailsForCompany,
);

router.get("/", auth(Role.COMPANY), AttemptController.getCompanyAttempts);

export const AttemptRoutes = router;
