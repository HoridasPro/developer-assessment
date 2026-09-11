import { z } from "zod";
import { Role } from "../../../../generated/prisma/enums";

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: "Email is not valid",
      }),

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

    status: z.string().trim().min(1, "Status is required"),

    profilePhoto: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: "custom",
            message: "Profile photo is required",
          });
          return;
        }

        try {
          new URL(value);
        } catch {
          ctx.addIssue({
            code: "custom",
            message: "Photo URL is not valid",
          });
        }
      }),
    role: z
      .string()
      .trim()
      .min(1, "Role is required")
      .transform((value) => value.toUpperCase())
      .refine((value) => value === Role.CANDIDATE || value === Role.COMPANY, {
        message: "Role must be CANDIDATE or COMPANY",
      }),

    isActive: z.boolean({
      message: "isActive must be true or false",
    }),

    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(/^01[3-9]\d{8}$/, "Phone number is not valid"),
  }),
});

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

export const AuthValidation = {
  createUserValidationSchema,
  userLoginValidationSchema,
};
