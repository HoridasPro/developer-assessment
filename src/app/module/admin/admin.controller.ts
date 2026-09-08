import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminServices } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers();

  sendResponse(res, {
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const adminId = req.data?.id;

  const result = await AdminServices.updateUserRole(
    id as string,
    role,
    adminId as string,
  );

  sendResponse(res, {
    success: true,
    message: "User role updated successfully",
    data: result,
  });
};

const getDashboardStats = async (req: Request, res: Response) => {
  const result = await AdminServices.getDashboardStats();

  sendResponse(res, {
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result,
  });
};

const getAuditLogs = async (req: Request, res: Response) => {
  const result = await AdminServices.getAuditLogs();

  sendResponse(res, {
    success: true,
    message: "Audit logs fetched successfully",
    data: result,
  });
};

const suspendUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const adminId = req.data?.id as string;
  console.log("ADMIN ID:", adminId);

  const result = await AdminServices.suspendUser(id as string, adminId);

  sendResponse(res, {
    success: true,
    message: "User suspended successfully",
    data: result,
  });
};

export const AdminController = {
  getAllUsers,
  updateUserRole,
  getDashboardStats,
  getAuditLogs,
  suspendUser,
};
