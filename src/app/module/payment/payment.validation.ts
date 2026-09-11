import z from "zod";

const assessmentIdValidationSchema = z.object({
  body: z.object({
    assessmentId: z
      .string()
      .trim()
      .min(1, "Assessment ID is required")
      .uuid("Assessment ID is not valid"),
  }),
});


const sessionIdValidationSchema = z.object({
  body: z.object({
    sessionId: z
      .string()
      .trim()
      .min(1, "Session ID is required")
      .regex(
        /^cs_(test|live)_[A-Za-z0-9]+$/,
        "Invalid Stripe session ID",
      ),
  }),
});
export const PaymentValidation = {
  assessmentIdValidationSchema,
  sessionIdValidationSchema
};
