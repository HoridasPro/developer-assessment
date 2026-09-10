import { z } from "zod";

const userLoginValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine(
        (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        {
          message: "Email is not valid",
        },
      ),
    password: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: "custom",
            message: "Password is required",
          });
          return;
        }

        if (value.length < 6) {
          ctx.addIssue({
            code: "custom",
            message: "Password must be at least 6 characters",
          });
        }
      }),
  }),
});

export const authValidation = {
  userLoginValidationSchema,
};
