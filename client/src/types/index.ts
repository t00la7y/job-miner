export interface Job {
  _id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  type?: string; // e.g., "Full-time", "Part-time", "Contract"
  source: 'Adzuna' | 'Remotive' | 'JSearch';
  applied?: boolean;
  savedAt?: string;
  image?: string;
  requirements?: string | string[];
  tags?: string[];
  postedDate?: string | Date;
  geminiData?: {
    jobTitle: string;
    company: string;
    questions: string[];
    difficulty: string;
  };
}