export interface UserProfile {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  location: string;
  profilePicture: string;

  // Account details
  subscriptionType: string;
  accountCreationDate: Date;
  accountStatus: "active" | "suspended" | "deleted";
  accountType: "jobSeeker" | "recruiter" | "admin";
  lastLogin: Date;
  preferences: {
    jobTypes: string[];
    industries: string[];
    experienceLevel: string;
  };

  // Tracking to train RAG bot and provide personalized experience for the user
  savedJobs: string[];
  clickedJobs: string[];
  searchHistory: string[];
  userPrompts: string[];
}

// Note: chat interactions are stored in a dedicated ChatHistory collection instead of on the user document.
