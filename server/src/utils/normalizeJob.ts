import { IJob } from '../models/job';

export const normalizeAdzuna = (jobs: any[]): Partial<IJob>[] =>
  jobs.map(job => ({
    title: job.title,
    company: job.company?.display_name || 'Unknown',
    location: job.location?.display_name || 'South Africa',
    description: job.description || '',
    url: job.redirect_url,
    salary: job.salary_min ? `R${job.salary_min}` : 'N/A',
    source: 'Adzuna' as const,
  }));

export const normalizeRemotive = (jobs: any[]): Partial<IJob>[] =>
  jobs.map(job => ({
    title: job.title,
    company: job.company_name || 'Unknown',
    location: job.candidate_required_location || 'Remote',
    description: job.description || '',
    url: job.url,
    salary: job.salary || 'N/A',
    source: 'Remotive' as const,
  }));

export const normalizeJSearch = (jobs: any[]): Partial<IJob>[] =>
  jobs.map(job => ({
    title: job.job_title,
    company: job.employer_name || 'Unknown',
    location: job.job_city || job.job_country || 'South Africa',
    description: job.job_description || '',
    url: job.job_apply_link,
    salary: job.job_salary || 'N/A',
    source: 'JSearch' as const,
  }));