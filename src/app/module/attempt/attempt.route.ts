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

export const AttemptRoutes = router;
