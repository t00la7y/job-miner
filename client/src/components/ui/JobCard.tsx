import type { Job } from '../../types';

const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3>{job.title}</h3>
      <p>{job.company}</p>
      <p>{job.location}</p>
    </div>
  );
};

export default JobCard;