import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);
router.patch("/users/:id/role", AdminController.updateUserRole);
// router.get("/dashboard-stats", AdminController.getDashboardStats);

export const AdminRoutes = router;
