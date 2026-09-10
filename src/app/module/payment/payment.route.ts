import express from "express";
import { PaymentController } from "./payment.controller";

import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = express.Router();

router.post("/initiate", auth(Role.COMPANY), PaymentController.initiatePayment);

router.post("/webhook", auth(Role.COMPANY), PaymentController.handleWebhook);

export const PaymentRoutes = router;
