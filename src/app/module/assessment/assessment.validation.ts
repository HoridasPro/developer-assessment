import z from "zod";
const createAssessmentValidationSchema = z
  .object({
    body: z.object({
      title: z.string().trim().min(1, "Assessment title is required"),

      description: z
        .string()
        .trim()
        .min(1, "Assessment description is required"),

      duration: z.number().positive("Duration must be greater than 0"),

      passingScore: z.number().nonnegative("Passing score cannot be negative"),

      maxAttempts: z
        .number()
        .int("Max attempts must be an integer")
        .positive("Max attempts must be greater than 0"),

      price: z.number().nonnegative("Price cannot be negative"),

      startAt: z.string().datetime({
        message: "Start date must be a valid ISO date",
      }),

      endAt: z.string().datetime({
        message: "End date must be a valid ISO date",
      }),
    }),
  })
  .superRefine((data, ctx) => {
    const startAt = new Date(data.body.startAt);
    const endAt = new Date(data.body.endAt);

    if (endAt <= startAt) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "endAt"],
        message: "End date must be after start date",
      });
    }
  });

const addQuestionsToAssessmentValidationSchema = z.object({
  body: z.object({
    options: z
      .array(
        z.object({
          questionId: z
            .string()
            .trim()
            .min(1, "Question ID is required")
            .uuid("Question ID is not valid"),

          order: z
            .number()
            .int("Order must be an integer")
            .positive("Order must be greater than 0"),
        }),
      )
      .min(1, "At least one question is required"),
  }),
});

const inviteCandidateValidationSchema = z.object({
  body: z.object({
    candidateUserId: z.string().trim().min(1, "Candidate user ID is required"),
  }),
});

export const AssessmentValidation = {
  createAssessmentValidationSchema,
  addQuestionsToAssessmentValidationSchema,
  inviteCandidateValidationSchema,
};
