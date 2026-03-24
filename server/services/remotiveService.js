const axios = require('axios');

const fetchRemotiveJobs = async (what, where = '') => {
  const res = await axios.get('https://remotive.com/api/remote-jobs');

  return res.data.jobs.filter(job => {
    const matchesWhat = job.title?.toLowerCase().includes(what.toLowerCase()) ||
      job.category?.toLowerCase().includes(what.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(what.toLowerCase());

    const matchesWhere = !where || where.toLowerCase() === 'all' ||
      job.candidate_required_location?.toLowerCase().includes(where.toLowerCase());

    return matchesWhat && matchesWhere;
  });
};

module.exports = fetchRemotiveJobs;