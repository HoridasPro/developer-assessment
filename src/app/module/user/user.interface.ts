// import { ActiveStatus, Role } from "../../../../generated/prisma/enums";

// export interface ICandidateProfile {
//   name: string;
//   profilePhoto: string;
//   role: Role;
//   status: ActiveStatus;
//   companyProfile?: {
//     bio?: string;
//     phone?: string;
//     location?: string;
//     skills?: string[];
//     experience?: number;
//     education?: string;
//     resumeUrl?: string;
//     portfolioUrl?: string;
//     githubUrl?: string;
//     linkedinUrl?: string;
//   };
// }

// export interface ICompanyProfile {
//   name: string;
//   profilePhoto: string;
//   role: Role;
//   status: ActiveStatus;

//   companyProfile?: {
//     companyName: string;
//     description?: string;
//     website?: string;
//   };
// }
export interface IUpdateMyProfile {
  name?: string;
  profilePhoto?: string;

  candidateProfile?: {
    bio?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    experience?: number; // <-- Schema-এর Int?-এর সাথে মেলাতে string কেটে number করা হয়েছে
    education?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  };

  companyProfile?: {
    companyName?: string; // <-- Partial Update-এর জন্য ? যোগ করা হয়েছে
    description?: string;
    website?: string;
  };
}
