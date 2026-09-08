import { Router } from "express";
import { QuestionController } from "./question.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.COMPANY), QuestionController.createQuestions);

router.get("/", auth(Role.COMPANY), QuestionController.getAllQuestions);

router.get("/:id", auth(Role.COMPANY), QuestionController.getQuestionById);

router.delete("/:id", auth(Role.COMPANY), QuestionController.deleteQuestion);
router.patch(
  "/:questionId",
  auth(Role.COMPANY),
  QuestionController.updateQuestion,
);

export const QuestionRoutes = router;
