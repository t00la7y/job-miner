
const fetchAdzunaJobs = require('../services/adzunaService');
const fetchRemotiveJobs = require('../services/remotiveService');
const fetchJSearchJobs = require('../services/jsearchService');

const {
  normalizeAdzuna,
  normalizeRemotive,
  normalizeJSearch
} = require('../utils/normalizeJobs');

const getJobs = async (req, res) => {
  try {
    const {
      what = 'developer',
      where = 'south africa',
      page = 1,
      source = 'all'
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);

    const sourcesToFetch = [];
    if (source === 'all' || source === 'adzuna') {
      sourcesToFetch.push({ name: 'adzuna', promise: fetchAdzunaJobs({ what, where, page: pageNumber }) });
    }
    if (source === 'all' || source === 'remotive') {
      sourcesToFetch.push({ name: 'remotive', promise: fetchRemotiveJobs(what, where) });
    }
    if (source === 'all' || source === 'jsearch') {
      sourcesToFetch.push({ name: 'jsearch', promise: fetchJSearchJobs(what, where, pageNumber) });
    }

    const rawResponses = await Promise.all(sourcesToFetch.map(item => item.promise));

    const jobs = sourcesToFetch.flatMap((item, idx) => {
      if (item.name === 'adzuna') return normalizeAdzuna(rawResponses[idx]);
      if (item.name === 'remotive') return normalizeRemotive(rawResponses[idx]);
      if (item.name === 'jsearch') return normalizeJSearch(rawResponses[idx]);
      return [];
    });

    const uniqueJobs = Array.from(
      new Map(jobs.map(job => [job.url, job])).values()
    );

    res.json(uniqueJobs);

  } catch (error) {
    console.error('Jobs fetch error', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = { getJobs };