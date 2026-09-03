import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerUserControllerDB);
router.post("/login", AuthController.userLoginDB);

export const AuhtRoutes = router;
