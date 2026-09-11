import { z } from "zod";

const submitAnswersValidationSchema = z.object({
  body: z.array(
    z
      .object({
        questionId: z
          .string()
          .trim()
          .min(1, "Question ID is required")
          .uuid("Question ID is not valid"),

        selectedOptionId: z
          .string()
          .trim()
          .uuid("Selected option ID is not valid")
          .optional(),

        writtenAnswer: z
          .string()
          .trim()
          .min(1, "Written answer cannot be empty")
          .optional(),

        codeAnswer: z
          .string()
          .trim()
          .min(1, "Code answer cannot be empty")
          .optional(),
      })
      .superRefine((answer, ctx) => {
        const count = [
          answer.selectedOptionId,
          answer.writtenAnswer,
          answer.codeAnswer,
        ].filter(Boolean).length;

        if (count === 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Either selectedOptionId, writtenAnswer or codeAnswer is required",
          });
        }

        if (count > 1) {
          ctx.addIssue({
            code: "custom",
            message: "Only one answer type is allowed",
          });
        }
      }),
  ),
});

export const AnswerValidation = {
  submitAnswersValidationSchema,
};
