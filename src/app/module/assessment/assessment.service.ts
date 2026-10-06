/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { prisma } from "../../lib/prisma";
import type { ICreateAssessmentPayload } from "./assessment.interface";

const createAssessment = async (
  userId: string,
  payload: ICreateAssessmentPayload,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.create({
    data: {
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      passingScore: payload.passingScore,
      maxAttempts: payload.maxAttempts ?? 1,

      price: payload.price ?? 0,

      startAt: payload.startAt ? new Date(payload.startAt) : undefined,

      endAt: payload.endAt ? new Date(payload.endAt) : undefined,

      companyId: company.id,
    },

    include: {
      company: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return assessment;
};

const deleteAssessment = async (
  assessmentId: string,
  companyUserId: string,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId: companyUserId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.companyId !== company.id) {
    throw new Error("You are not allowed to delete this assessment");
  }

  if (assessment.isDeleted) {
    throw new Error("Assessment is already deleted");
  }

  await prisma.assessment.update({
    where: {
      id: assessmentId,
    },
    data: {
      isDeleted: true,
    },
  });

  return {
    assessmentId,
  };
};

const addQuestionsToAssessment = async (
  userId: string,
  assessmentId: string,
  questionsData: { questionId: string; order: number; marks?: number }[],
) => {
  const company = await prisma.companyProfile.findUnique({
    where: { userId },
  });

  if (!company) throw new Error("Company profile not found");

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, companyId: company.id },
  });

  if (!assessment) throw new Error("Assessment not found");

  const createdQuestions = await prisma.$transaction(
    questionsData.map((item) =>
      prisma.assessmentQuestion.create({
        data: {
          assessmentId,
          questionId: item.questionId,
          order: item.order,
        },
        include: {
          questions: {
            include: { options: true },
          },
        },
      }),
    ),
  );

  return createdQuestions;
};

// const getAssessmentQuestions = async (assessmentId: string) => {
//   const questions = await prisma.assessmentQuestion.findMany({
//     where: {
//       assessmentId,
//     },
//     orderBy: {
//       order: "asc",
//     },
//     include: {
//       questions: {
//         // 👈 ১. 'questions' এর বদলে 'question' (একবচন)
//         include: {
//           options: true, // 👈 ২. MCQ অপশনগুলো লোড করার জন্য include করা হলো
//         },
//       },
//     },
//   });

//   return questions.map((item) => ({
//     id: item.questions.id,
//     title: item.questions.title,
//     description: item.questions.description,
//     type: item.questions.type,
//     category: item.questions.category,
//     difficulty: item.questions.difficulty,
//     marks: item.marks ?? item.questions.marks, // 👈 ৩. অ্যাসেসমেন্ট পিভট টেবিলের মার্কস
//     order: item.order,
//     questionOptions: item.questions.options || [], // 👈 ৪. অপশনগুলো ফ্রন্টএন্ডে পাঠানো হলো
//   }));
// };

// const getAssessmentQuestions = async (assessmentId: string) => {
//   const questions = await prisma.assessmentQuestion.findMany({
//     where: {
//       assessmentId,
//     },
//     orderBy: {
//       order: "asc",
//     },
//     include: {
//       questions: true, // Question info (title, description, type, etc.)
//       options: true, // 👈 আসল সমাধান: AssessmentQuestion মডেলে থাকা options include করা হলো
//     },
//   });

//   return questions.map((item) => ({
//     id: item.questions.id,
//     title: item.questions.title,
//     description: item.questions.description,
//     type: item.questions.type,
//     category: item.questions.category,
//     difficulty: item.questions.difficulty,
//     marks: item.marks ?? item.questions.marks, // Pivot table-এর মার্কস, না থাকলে Question-এর মার্কস
//     order: item.order,
//     questionOptions: item.options || [], // 👈 ফ্রন্টএন্ডে অপশনগুলো পেয়ে যাবে
//   }));
// };

const getAssessmentQuestions = async (assessmentId: string) => {
  const questions = await prisma.assessmentQuestion.findMany({
    where: {
      assessmentId,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      // ১. Prisma schema-তে relation নাম single ('question') নাকি plural ('questions') তা চেক করুন।
      // সাধারণত relation-এর নাম 'question' বা 'questions' হতে পারে।
      questions: {
        include: {
          // ২. Question-এর ভেতরের options include করতে হবে
          options: true, // schema অনুযায়ী 'options' বা 'questionOptions'
        },
      },
    },
  });

  return questions.map((item) => {
    // schema অনুযায়ী 'question' বা 'questions' ব্যবহার করুন
    const q = item.questions || item.questions;

    return {
      id: q.id,
      title: q.title,
      description: q.description,
      type: q.type,
      category: q.category,
      difficulty: q.difficulty,
      marks: item.marks ?? q.marks,
      order: item.order,
      // q.options বা q.questionOptions থেকে অপশন পাবেন
      questionOptions: q.options,
    };
  });
};

const publishAssessment = async (userId: string, assessmentId: string) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      companyId: company.id,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.status === "PUBLISHED") {
    const publishedAssessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      include: {
        company: true,

        questions: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return publishedAssessment;
  }

  const questionCount = await prisma.assessmentQuestion.count({
    where: {
      assessmentId,
    },
  });

  if (questionCount === 0) {
    throw new Error("Cannot publish assessment without questions");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      assessmentId: assessment.id,
      companyId: company.id,
      status: "PAID",
    },
  });

  if (!payment) {
    throw new Error(
      "Please make payment first before publishing this assessment",
    );
  }

  const publishedAssessment = await prisma.assessment.update({
    where: {
      id: assessmentId,
    },
    data: {
      status: "PUBLISHED",
    },
    include: {
      company: true,

      questions: {
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return publishedAssessment;
};
const inviteCandidate = async (
  userId: string,
  assessmentId: string,
  candidateUserId: string,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      companyId: company.id,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.status !== "PUBLISHED") {
    throw new Error("First payment then auto published assessment can be sent to candidates");
  }

  const candidate = await prisma.user.findUnique({
    where: {
      id: candidateUserId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found");
  }

  if (candidate.role !== "CANDIDATE") {
    throw new Error("This user is not a candidate");
  }

  const existingInvitation = await prisma.assessmentInvitation.findUnique({
    where: {
      assessmentId_candidateUserId: {
        assessmentId,
        candidateUserId,
      },
    },
  });

  if (existingInvitation) {
    throw new Error("Candidate already invited to this assessment");
  }

  const invitation = await prisma.assessmentInvitation.create({
    data: {
      assessmentId,
      candidateUserId,
    },
    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          passingScore: true,
          maxAttempts: true,
          startAt: true,
          endAt: true,
          status: true,
        },
      },
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return invitation;
};

const searchAssessments = async (companyUserId: string, keyword: string) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId: companyUserId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessments = await prisma.assessment.findMany({
    where: {
      companyId: company.id,
      isDeleted: false,
      OR: [
        {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return assessments;
};

const getAllAssessments = async (
  companyUserId: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId: companyUserId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const skip = (page - 1) * limit;

  const where: any = {
    companyId: company.id,
    isDeleted: false,
  };

  // status filter
  if (status) {
    where.status = status;
  }

  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.assessment.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: assessments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const getAssessmentById = async (
  assessmentId: string,
  companyUserId: string,
) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId: companyUserId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      companyId: company.id,
      isDeleted: false,
    },
    include: {
      questions: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  return assessment;
};

export const AssessmentService = {
  createAssessment,
  deleteAssessment,
  addQuestionsToAssessment,
  getAssessmentQuestions,
  publishAssessment,
  inviteCandidate,
  searchAssessments,
  getAllAssessments,
  getAssessmentById,
};
