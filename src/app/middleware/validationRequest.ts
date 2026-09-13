import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";

export const validateRequest = (schema: ZodObject<any>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				params: req.params,
				query: req.query,
			});

			next();
		} catch (error) {
			next(error);
		}
	};
};
