import express from "express";
import { PaymentController } from "./payment.controller";

import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validationRequest";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/initiate",
  validateRequest(PaymentValidation.assessmentIdValidationSchema),
  auth(Role.COMPANY),
  PaymentController.initiatePayment,
);

router.post(
  "/webhook",
  validateRequest(PaymentValidation.sessionIdValidationSchema),
  auth(Role.COMPANY),
  PaymentController.handleWebhook,
);
router.get("/:id", auth(Role.COMPANY), PaymentController.getPaymentById);
router.get("/", auth(Role.COMPANY), PaymentController.getAllPayments);

export const PaymentRoutes = router;
