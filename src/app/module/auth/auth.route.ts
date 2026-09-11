import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validationRequest";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.createUserValidationSchema),
  AuthController.registerUserControllerDB,
);
router.post(
  "/login",
  validateRequest(AuthValidation.userLoginValidationSchema),
  AuthController.userLoginDB,
);
router.post("/refresh-token", AuthController.refreshTokenDB);

export const AuhtRoutes = router;
