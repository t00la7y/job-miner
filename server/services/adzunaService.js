const axios = require('axios');

const fetchAdzunaJobs = async ({ what, where, page }) => {
  const res = await axios.get(
    `https://api.adzuna.com/v1/api/jobs/za/search/${page}`,
    {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        results_per_page: 20,
        what,
        where
      }
    }
  );

  return res.data.results || [];
};

module.exports = fetchAdzunaJobs;