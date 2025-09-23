// backend/src/routes/tmdbRoutes.js
const express = require("express");
const router = express.Router();

// Import TMDb controllers
const {
  getAny50Movies,
  getPopularMovies,
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  getGenres,
  getMoviesByGenre,
} = require("../controllers/tmdbController");

// -------------------------
// TMDb Routes
// -------------------------

// Get any 50 movies (popular + top-rated + upcoming)
router.get("/any50", getAny50Movies);

// Get popular movies
router.get("/popular", getPopularMovies);

// Get trending movies (day or week)
router.get("/trending/:type?", getTrendingMovies); // optional type param, defaults to 'day'

// Search movies by query (query string: ?query=movie_name)
router.get("/search", searchMovies);

// Get movie details by ID
router.get("/movie/:id", getMovieDetails);

// Get list of genres
router.get("/genres", getGenres);

// Get movies by genre ID
router.get("/genre/:id", getMoviesByGenre);

module.exports = router;
