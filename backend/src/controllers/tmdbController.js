// backend/src/controllers/tmdbController.js
const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// ---------- Axios instance with timeout ----------
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000, // 10 seconds
  params: { api_key: TMDB_API_KEY },
});

// ---------- Fetch TMDb with retry ----------
async function fetchTMDb(url, params = {}) {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const res = await tmdbAxios.get(url, { params });
      return res.data;
    } catch (err) {
      attempts++;
      console.warn(`Retrying ${url} due to error: ${err.message} (attempt ${attempts})`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error(`Failed to fetch from TMDb after 3 attempts: ${url}`);
}

// ---------- Helper to format movies ----------
function formatMovies(results) {
  return results.map(movie => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster: movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null,
    backdrop: movie.backdrop_path ? TMDB_IMAGE_BASE + movie.backdrop_path : null,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    runtime: movie.runtime || null,
  }));
}

// ---------- Controllers ----------

// Get any 50 movies
exports.getAny50Movies = async (req, res) => {
  try {
    const page1 = await fetchTMDb("/movie/popular", { page: 1 });
    const page2 = await fetchTMDb("/movie/popular", { page: 2 });
    const page3 = await fetchTMDb("/movie/popular", { page: 3 });

    const combined = [...page1.results, ...page2.results, ...page3.results].slice(0, 50);
    res.status(200).json({ results: formatMovies(combined) });
  } catch (err) {
    console.error("getAny50Movies Error:", err.message);
    res.status(500).json({ error: "Failed to fetch 50 movies", details: err.message });
  }
};

// Get popular movies
exports.getPopularMovies = async (req, res) => {
  try {
    const data = await fetchTMDb("/movie/popular");
    res.status(200).json({ results: formatMovies(data.results) });
  } catch (err) {
    console.error("getPopularMovies Error:", err.message);
    res.status(500).json({ error: "Failed to fetch popular movies", details: err.message });
  }
};

// Get trending movies (day/week)
exports.getTrendingMovies = async (req, res) => {
  const type = req.params.type || "day";
  if (!["day", "week"].includes(type)) return res.status(400).json({ error: "Invalid trending type" });

  try {
    const data = await fetchTMDb(`/trending/movie/${type}`);
    res.status(200).json({ results: formatMovies(data.results) });
  } catch (err) {
    console.error("getTrendingMovies Error:", err.message);
    res.status(500).json({ error: `Failed to fetch trending movies ${type}`, details: err.message });
  }
};

// Search movies
exports.searchMovies = async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  try {
    const data = await fetchTMDb("/search/movie", { query });
    res.status(200).json({ results: formatMovies(data.results) });
  } catch (err) {
    console.error("searchMovies Error:", err.message);
    res.status(500).json({ error: "Failed to search movies", details: err.message });
  }
};

// Get movie details
exports.getMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  if (!movieId) return res.status(400).json({ error: "Movie ID is required" });

  try {
    const movie = await fetchTMDb(`/movie/${movieId}`);
    res.status(200).json({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster: movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null,
      backdrop: movie.backdrop_path ? TMDB_IMAGE_BASE + movie.backdrop_path : null,
      genres: movie.genres.map(g => g.name),
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      runtime: movie.runtime,
    });
  } catch (err) {
    console.error("getMovieDetails Error:", err.message);
    res.status(500).json({ error: "Failed to fetch movie details", details: err.message });
  }
};

// Get genres
exports.getGenres = async (req, res) => {
  try {
    const data = await fetchTMDb("/genre/movie/list", { language: "en-US" });
    res.status(200).json(data.genres);
  } catch (err) {
    console.error("getGenres Error:", err.message);
    res.status(500).json({ error: "Failed to fetch genres", details: err.message });
  }
};

// Get movies by genre
exports.getMoviesByGenre = async (req, res) => {
  const genreId = req.params.id;
  if (!genreId) return res.status(400).json({ error: "Genre ID is required" });

  try {
    const data = await fetchTMDb("/discover/movie", { with_genres: genreId, sort_by: "popularity.desc" });
    res.status(200).json({ results: formatMovies(data.results) });
  } catch (err) {
    console.error("getMoviesByGenre Error:", err.message);
    res.status(500).json({ error: "Failed to fetch movies by genre", details: err.message });
  }
};
