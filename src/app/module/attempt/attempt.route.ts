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

router.post(
  "/submit/:attemptId",
  auth(Role.CANDIDATE),
  AttemptController.submitAttempt,
);
router.post(
  "/evaluate/:attemptId",
  auth(Role.CANDIDATE),
  AttemptController.evaluateAttempt,
);
router.get(
  "/result/:attemptId",
  auth(Role.CANDIDATE),
  AttemptController.getAttemptResult,
);

// router.get(
//   "/my-results",
//   auth(Role.CANDIDATE),
//   AttemptController.getAllMyAssessmentResults,
// );

export const AttemptRoutes = router;
