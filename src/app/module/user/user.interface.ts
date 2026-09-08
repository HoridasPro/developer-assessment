export interface IUpdateMyProfile {
  name?: string;
  profilePhoto?: string;

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

  companyProfile?: {
    companyName?: string;
    description?: string;
    website?: string;
  };
}
