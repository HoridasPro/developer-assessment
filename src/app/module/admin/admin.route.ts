import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);
router.patch(
  "/users/:id/role",
  auth(Role.ADMIN),
  AdminController.updateUserRole,
);
router.get(
  "/dashboard-stats",
  auth(Role.ADMIN),
  AdminController.getDashboardStats,
);
router.get("/audit-logs", auth(Role.ADMIN), AdminController.getAuditLogs);

export const AdminRoutes = router;
