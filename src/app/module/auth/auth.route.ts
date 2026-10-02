import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import { AuthValidation } from "./auth.validation";
import { AuthController } from "./auth.controller";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.createUserValidationSchema),
  AuthController.registerUserControllerDB,
);

router.post("/verify-email-otp", AuthController.verifyEmailOtp);

router.post(
  "/login",
  validateRequest(AuthValidation.userLoginValidationSchema),
  AuthController.userLogin,
);

router.post("/verify-login-otp", AuthController.verifyLoginOtp);

router.post(
  "/google-login",
  validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.googleLogin,
);
router.post("/refresh-token", AuthController.refreshTokenDB);
router.post("/logout", AuthController.logout);

export const AuhtRoutes = router;
