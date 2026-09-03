import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerUserControllerDB);
router.post("/login", AuthController.userLoginDB);
router.post("/refresh-token", AuthController.refreshTokenDB);

export const AuhtRoutes = router;
