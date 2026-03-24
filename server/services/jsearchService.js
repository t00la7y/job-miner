const axios = require('axios');
require('dotenv').config();

const fetchJSearchJobs = async (what = 'developer', where = 'south africa', page = 1) => {
  if (!process.env.RAPID_API_KEY || !process.env.RAPID_API_HOST) {
    console.warn('JSearch API keys are missing; skipping JSearch source');
    return [];
  }

  const queryParts = [what];
  if (where) queryParts.push(`in ${where}`);

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: queryParts.join(' '),
        page: String(page),
        num_pages: '1',
        country: 'za'
      },
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': process.env.RAPID_API_HOST
      }
    });

    console.log(`JSearch: ${response.data.data?.length || 0} jobs found for "${what}" @ "${where}"`);
    return response.data.data || [];
  } catch (error) {
    console.error('JSearch API Error:', error.response?.data || error.message);
    return [];
  }
};

module.exports = fetchJSearchJobs;