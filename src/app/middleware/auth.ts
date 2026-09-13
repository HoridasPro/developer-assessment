// import type { NextFunction, Request, Response } from "express";
// import { catchAsync } from "../utils/catchAsync";
// import { prisma } from "../lib/prisma";
// import { ActiveStatus, type Role } from "../../../generated/prisma/enums";
// import { jwtUtils } from "../utils/jwt";
// import type { JwtPayload } from "jsonwebtoken";

// declare global {
// 	namespace Express {
// 		interface Request {
// 			data?: {
// 				email: string;
// 				id: string;
// 				role: Role;
// 			};
// 		}
// 	}
// }

// export const auth = (...requiredRoles: Role[]) => {
// 	return catchAsync(
// 		async (req: Request, _res: Response, next: NextFunction) => {
// 			const authHeader = req.headers.authorization;

// 			let token: string | undefined;

// 			if (authHeader && authHeader.startsWith("Bearer ")) {
// 				token = authHeader.split(" ")[1];
// 			} else if (req.cookies?.accessToken) {
// 				token = req.cookies.accessToken;
// 			}

// 			if (!token) {
// 				throw new Error("User not logged in. Please login first.");
// 			}

// 			const jwt_access_secret = process.env.JWT_ACCESS_SECRET;

// 			if (!jwt_access_secret) {
// 				throw new Error("JWT_ACCESS_SECRET is not defined");
// 			}

// 			const verifiedToken = jwtUtils.verifyToken(token, jwt_access_secret);

// 			if (!verifiedToken.success) {
// 				throw new Error(verifiedToken.error || "Invalid token");
// 			}

// 			const { userId, email, role } = verifiedToken.data as JwtPayload & {
// 				userId: string;
// 				role: Role;
// 			};

// 			if (requiredRoles.length && !requiredRoles.includes(role)) {
// 				throw new Error(
// 					"Forbidden. You have no permission to access this resource.",
// 				);
// 			}

// 			const user = await prisma.user.findUnique({
// 				where: { id: userId },
// 			});

// 			if (!user) {
// 				throw new Error("User not found");
// 			}

// 			if (user.status === ActiveStatus.BLOCKED) {
// 				throw new Error("User is blocked");
// 			}

// 			req.data = {
// 				id: userId,
// 				email,
// 				role,
// 			};

// 			next();
// 		},
// 	);
// };
import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { ActiveStatus, type Role } from "../../../generated/prisma/enums";
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
      const authHeader = req.headers.authorization;

      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw new Error("User not logged in. Please login first.");
      }

      const jwt_access_secret = process.env.JWT_ACCESS_SECRET;

      if (!jwt_access_secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
      }

      const verifiedToken = jwtUtils.verifyToken(token, jwt_access_secret);

      if (!verifiedToken.success) {
        throw new Error(verifiedToken.error || "Invalid token");
      }

      const decoded = verifiedToken.data as JwtPayload & {
        userId?: string;
        id?: string;
        email: string;
        role: Role;
      };

      // 1. userId বা id দুটো থেকেই চেক করে আইডি নিশ্চিত নেওয়া
      const targetUserId = decoded.userId || decoded.id;
      const { email, role } = decoded;

      // 2. আইডি না থাকলে Prisma কল করার আগেই আটকানো
      if (!targetUserId) {
        throw new Error("Invalid token payload: User ID missing");
      }

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new Error(
          "Forbidden. You have no permission to access this resource.",
        );
      }

      // 3. Prisma call-এ targetUserId পাস করা
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.status === ActiveStatus.BLOCKED) {
        throw new Error("User is blocked");
      }

      req.data = {
        id: targetUserId,
        email,
        role,
      };

      next();
    },
  );
};
