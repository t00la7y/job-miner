export interface Job {
  _id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary: string;
  source: 'Adzuna' | 'Remotive' | 'JSearch';
  applied?: boolean;
  savedAt?: string;
  geminiData?: {
    jobTitle: string;
    company: string;
    questions: string[];
    difficulty: string;
  };
}