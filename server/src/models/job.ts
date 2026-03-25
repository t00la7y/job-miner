import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary: string;
  source: 'Adzuna' | 'Remotive' | 'JSearch';
  applied: boolean;
  interviewNotes?: string;
  geminiData?: {
    jobTitle: string;
    company: string;
    questions: string[];
    difficulty: string;
  };
  savedAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  salary: { type: String, default: 'N/A' },
  source: { 
    type: String, 
    enum: ['Adzuna', 'Remotive', 'JSearch'], 
    required: true 
  },
  applied: { type: Boolean, default: false },
  interviewNotes: { type: String },
  geminiData: {
    jobTitle: String,
    company: String,
    questions: [String],
    difficulty: String
  },
  savedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IJob>('Job', JobSchema);