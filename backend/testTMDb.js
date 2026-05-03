const axios = require("axios");
// used only for test data
const BASE_URL = "http://localhost:5000/api/tmdb";

async function testEndpoints() {
  try {
    // 1️⃣ Search movies
    const searchRes = await axios.get(`${BASE_URL}/search`, { params: { query: "Inception" } });
    console.log("🔍 Search movies response:", searchRes.data.results[0]);

    // 2️⃣ Movie details
    const movieId = searchRes.data.results[0].id;
    const detailsRes = await axios.get(`${BASE_URL}/movie/${movieId}`);
    console.log("🎬 Movie details response:", detailsRes.data.title);

    // 3️⃣ Trending day
    const trendingDay = await axios.get(`${BASE_URL}/trending/day`);
    console.log("📈 Trending day first movie:", trendingDay.data.results[0].title);

    // 4️⃣ Trending week
    const trendingWeek = await axios.get(`${BASE_URL}/trending/week`);
    console.log("📈 Trending week first movie:", trendingWeek.data.results[0].title);

    // 5️⃣ Genres
    const genresRes = await axios.get(`${BASE_URL}/genres`);
    console.log("🎭 Genres list first genre:", genresRes.data.genres[0]);

    // 6️⃣ Movies by genre
    const genreId = genresRes.data.genres[0].id;
    const moviesByGenre = await axios.get(`${BASE_URL}/genre/${genreId}/movies`);
    console.log(`🎭 Movies for genre ${genresRes.data.genres[0].name}:`, moviesByGenre.data.results[0].title);

    console.log("✅ All endpoints are working!");
  } catch (error) {
    console.error("❌ Error testing TMDb endpoints:", error.message);
  }
}

testEndpoints();
