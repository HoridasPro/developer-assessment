import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { AnswerController } from "./answer.controller";

const router = Router();

router.post(
  "/questions/answer/:attemptId",
  auth(Role.CANDIDATE),
  AnswerController.saveAnswer,
);

export const AnswerRoutes = router;
