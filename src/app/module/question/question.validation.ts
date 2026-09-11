import { z } from "zod";

const createQuestionsValidationSchema = z.object({
  body: z.object({
    questions: z
      .array(
        z
          .object({
            title: z.string().trim().min(1, "MCQ Question title is required"),

            description: z.string().trim().min(1, "Description is required"),

            type: z.enum(["MCQ", "WRITTEN", "CODING"], {
              message: "Question type must be MCQ, WRITTEN or CODING",
            }),

            category: z.string().trim().min(1, "Question category is required"),

            difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
              message: "Difficulty must be EASY, MEDIUM or HARD",
            }),

            marks: z.number().positive("Marks must be greater than 0"),

            option: z.string().trim().optional(),

            options: z
              .array(
                z.object({
                  text: z.string().trim().min(1, "Option text is required"),

                  isCorrect: z.boolean({
                    message: "isCorrect must be true or false",
                  }),
                }),
              )
              .optional(),
          })
          .superRefine((question, ctx) => {
            // MCQ validation
            if (question.type === "MCQ") {
              if (!question.options || question.options.length < 2) {
                ctx.addIssue({
                  code: "custom",
                  path: ["options"],
                  message: "MCQ must have at least 2 options",
                });
              }

              if (
                question.options &&
                !question.options.some((option) => option.isCorrect)
              ) {
                ctx.addIssue({
                  code: "custom",
                  path: ["options"],
                  message: "MCQ must have at least one correct option",
                });
              }
            }

            // Written/Coding should not have options
            if (
              (question.type === "WRITTEN" || question.type === "CODING") &&
              question.options
            ) {
              ctx.addIssue({
                code: "custom",
                path: ["options"],
                message: `${question.type} question cannot have options`,
              });
            }
          }),
      )
      .min(1, "At least one question is required"),
  }),
});

const bulkUpdateQuestionsValidationSchema = z.object({
  body: z.object({
    questions: z
      .array(
        z
          .object({
            id: z.string().uuid("Question ID is not valid"),

            title: z.string().trim().min(1, "Question title is required"),

            description: z
              .string()
              .trim()
              .min(1, "Question description is required"),

            type: z.enum(["MCQ", "WRITTEN", "CODING"]),

            category: z.string().trim().min(1, "Question category is required"),

            difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),

            marks: z.number().positive("Marks must be greater than 0"),

            option: z.string().trim().optional(),

            options: z
              .array(
                z.object({
                  text: z.string().trim().min(1, "Option text is required"),

                  isCorrect: z.boolean(),
                }),
              )
              .optional(),
          })
          .superRefine((question, ctx) => {
            if (question.type === "MCQ") {
              if (!question.options || question.options.length < 2) {
                ctx.addIssue({
                  code: "custom",
                  path: ["options"],
                  message: "MCQ must have at least 2 options",
                });
              }

              if (
                question.options &&
                !question.options.some((option) => option.isCorrect === true)
              ) {
                ctx.addIssue({
                  code: "custom",
                  path: ["options"],
                  message: "MCQ must have at least one correct option",
                });
              }
            }

            if (
              (question.type === "WRITTEN" || question.type === "CODING") &&
              question.options
            ) {
              ctx.addIssue({
                code: "custom",
                path: ["options"],
                message: `${question.type} question cannot have options`,
              });
            }
          }),
      )
      .min(1, "At least one question is required"),
  }),
});
export const QuestionValidation = {
  createQuestionsValidationSchema,
  bulkUpdateQuestionsValidationSchema,
};
