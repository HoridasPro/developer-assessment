import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../../generated/prisma/client";
import config from "../config";

export const globalErrorHandler = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (config.node_env === "development") {
    console.log("Error from Global Error Handler:", err);
  }

  let statusCode = 500;
  let errorMessage = "Something went wrong";
  const errors: unknown[] = [];

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "Invalid data provided";
  }

  // Prisma Known Request Error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      errorMessage = "User already exists";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = 404;
      errorMessage = "Requested record was not found";
    }
  }

  // Prisma Initialization Error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    errorMessage = "Database connection failed";
  }

  // Prisma Unknown Request Error
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  }

  // Normal JavaScript Error
  else if (err instanceof Error) {
    statusCode = 400;
    errorMessage = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    errors,
  });
};
