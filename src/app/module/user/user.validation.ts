import z from "zod";

const updateCandidateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),

    profilePhoto: z
      .string()
      .trim()
      .min(1, "Profile photo is required")
      .url("Photo URL is not valid"),

    candidateProfile: z.object({
      bio: z.string().trim().min(1, "Bio is required"),

      phone: z
        .string()
        .trim()
        .min(1, "Phone number is required")
        .regex(/^\+8801[3-9]\d{8}$/, "Phone number is not valid"),

      location: z.string().trim().min(1, "Location is required"),

      skills: z
        .array(z.string().trim().min(1, "Skill cannot be empty"))
        .min(1, "At least one skill is required"),

      experience: z.number().min(0, "Experience cannot be negative"),

      education: z.string().trim().min(1, "Education is required"),

      resumeUrl: z.string().trim().url("Resume URL is not valid"),

      portfolioUrl: z.string().trim().url("Portfolio URL is not valid"),

      githubUrl: z.string().trim().url("Github URL is not valid"),

      linkedinUrl: z.string().trim().url("LinkedIn URL is not valid"),
    }),
  }),
});

export const userValidation = {
  updateCandidateProfileValidationSchema,
};
const updateCompanyProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),

    profilePhoto: z
      .string()
      .trim()
      .min(1, "Profile photo is required")
      .url("Photo URL is not valid"),

    companyProfile: z.object({
      companyName: z.string().trim().min(1, "Company name is required"),

      description: z.string().trim().min(1, "Company description is required"),

      website: z
        .string()
        .trim()
        .min(1, "Website is required")
        .url("Website URL is not valid"),
    }),
  }),
});

export const UserValidation = {
  updateCandidateProfileValidationSchema,
  updateCompanyProfileValidationSchema,
};
