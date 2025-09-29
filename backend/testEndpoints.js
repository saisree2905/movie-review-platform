const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testEndpoints = async () => {
  console.log('--- Testing TMDb Endpoints ---\n');

  const endpoints = [
    { name: 'Homepage movies', url: `${BASE_URL}/movies/homepage?page=1` },
    { name: 'Latest movie', url: `${BASE_URL}/movies/latest` },
    { name: 'Genres', url: `${BASE_URL}/genres` },
  ];

  for (let ep of endpoints) {
    try {
      const res = await axios.get(ep.url);
      console.log(`✅ Success for ${ep.name}:`, Array.isArray(res.data.results) ? `${res.data.results.length} items` : 'OK');
    } catch (err) {
      console.error(`❌ Error for ${ep.name}:`, err.response?.data || err.message);
    }
  }

  // If genres worked, test first genre movies
  try {
    const genresRes = await axios.get(`${BASE_URL}/genres`);
    const firstGenreId = genresRes.data.genres[0]?.id;
    if (!firstGenreId) throw new Error('No genres found');

    try {
      const res = await axios.get(`${BASE_URL}/movies/genre/${firstGenreId}`);
      console.log(`✅ Success for Movies by Genre (${firstGenreId}):`, res.data.results.length, 'movies');
    } catch (err) {
      console.error(`❌ Error for Movies by Genre (${firstGenreId}):`, err.response?.data || err.message);
    }

  } catch (err) {
    console.error('❌ Cannot fetch genres, skipping Movies by Genre test:', err.message);
  }

  console.log('\n--- Testing Completed ---');
};

testEndpoints();
