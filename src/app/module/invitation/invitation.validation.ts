import z from "zod";

const statusValidationSchema = z.object({
  body: z.object({
    status: z
      .string()
      .trim()
      .min(1, "Status is required")
      .transform((value) => value.toUpperCase())
      .refine((value) => value === "ACCEPTED", {
        message: "Invalid status",
      }),
  }),
});
export const InvitationValidation = {
  statusValidationSchema,
};
