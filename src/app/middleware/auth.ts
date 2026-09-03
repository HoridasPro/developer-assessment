import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

import { prisma } from "../lib/prisma";
import { ActiveStatus, Role } from "../../../generated/prisma/enums";
import { jwtUtils } from "../utils/jwt";
import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      data?: {
        email: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      // const token = req.cookies.accessToken
      //   ? req.cookies.accessToken
      //   : req.headers.authorization?.startsWith("Bearer ")
      //     ? req.headers.authorization.split(" ")[1]
      //     : req.headers.authorization;

      const authHeader = req.headers.authorization;

      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies.accessToken;
      console.log("get token", token);

      if (!token) {
        throw new Error("User not logged in. Please login first.");
      }

      const jwt_access_secret = process.env.JWT_ACCESS_SECRET;

      if (!jwt_access_secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
      }

      const verifiedToken = jwtUtils.verifyToken(token, jwt_access_secret);

      if (!verifiedToken.success) {
        throw new Error(verifiedToken.error);
      }

      const { id, email, role } = verifiedToken.data as JwtPayload;

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new Error(
          "Forbidden. You have no permission to access this resource.",
        );
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.status === ActiveStatus.BLOCKED) {
        throw new Error("User is blocked");
      }

      req.data = {
        id,
        email,
        role,
      };

      next();
    },
  );
};
