import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validationRequest";
import { authValidation } from "./auth.validation";

const router = Router();

router.post("/register", AuthController.registerUserControllerDB);
router.post(
  "/login",
  validateRequest(authValidation.userLoginValidationSchema),
  AuthController.userLoginDB,
);
router.post("/refresh-token", AuthController.refreshTokenDB);

export const AuhtRoutes = router;
