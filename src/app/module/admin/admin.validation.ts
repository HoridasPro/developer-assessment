import z from "zod";

const roleValidationSchema = z.object({
  body: z.object({
    role: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .refine((value) => value === "CANDIDATE" || value === "COMPANY", {
        message: "Role must be CANDIDATE OR COMPANY",
      }),
  }),
});
export const AdminValidation = {
  roleValidationSchema,
};
