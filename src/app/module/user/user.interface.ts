import { ActiveStatus, Role } from "../../../../generated/prisma/enums";

export interface ICandidateProfile {
  name: string;
  profilePhoto: string;
  role: Role;
  status: ActiveStatus;
  candidateProfile?: {
    bio?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    experience?: number;
    education?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  };
}
