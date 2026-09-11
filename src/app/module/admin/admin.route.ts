import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middleware/validationRequest";
import { AdminValidation } from "./admin.validation";

const router = Router();

router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);
router.patch(
  "/users/:id/role",
  validateRequest(AdminValidation.roleValidationSchema),
  auth(Role.ADMIN),
  AdminController.updateUserRole,
);
router.get(
  "/dashboard-stats",
  auth(Role.ADMIN),
  AdminController.getDashboardStats,
);
router.get("/audit-logs", auth(Role.ADMIN), AdminController.getAuditLogs);

router.patch(
  "/users/:id/suspend",
  auth(Role.ADMIN),
  AdminController.suspendUser,
);

export const AdminRoutes = router;
