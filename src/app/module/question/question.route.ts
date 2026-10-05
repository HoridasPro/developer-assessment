import { Router } from "express";
import { QuestionController } from "./question.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validationRequest";
import { QuestionValidation } from "./question.validation";

const router = Router();

router.post(
  "/",
  validateRequest(QuestionValidation.createQuestionsValidationSchema),
  auth(Role.COMPANY),
  QuestionController.createQuestions,
);

router.get("/", auth(Role.COMPANY), QuestionController.getAllQuestions);

router.get("/:id", auth(Role.COMPANY), QuestionController.getQuestionById);

router.delete("/:id", auth(Role.COMPANY), QuestionController.deleteQuestion);
router.patch(
  "/bulk-update",
  validateRequest(QuestionValidation.bulkUpdateQuestionsValidationSchema),
  auth(Role.COMPANY),
  QuestionController.bulkUpdateQuestions,
);

export const QuestionRoutes = router;
