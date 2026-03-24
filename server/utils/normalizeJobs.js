
const normalizeAdzuna = (jobs) =>
  jobs.map(job => ({
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    description: job.description,
    url: job.redirect_url,
    salary: job.salary_min || 'N/A',
    source: 'adzuna'
  }));

const normalizeRemotive = (jobs) =>
  jobs.map(job => ({
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location,
    description: job.description,
    url: job.url,
    salary: job.salary || 'N/A',
    source: 'remotive'
  }));

const normalizeJSearch = (jobs) =>
  jobs.map(job => ({
    title: job.job_title,
    company: job.employer_name,
    location: job.job_city || 'Unknown',
    description: job.job_description,
    url: job.job_apply_link,
    salary: job.job_salary || 'N/A',
    source: 'jsearch'
  }));

module.exports = {
  normalizeAdzuna,
  normalizeRemotive,
  normalizeJSearch
};