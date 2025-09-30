require('dotenv').config();
const express = require('express');
const cors = require("cors");
const axios = require('axios');
const path = require('path');

const contactRoutes = require('./src/routes/contactRoutes');
const authRoutes = require('./src/routes/authRoutes');
const movieRoutes = require('./src/routes/movieRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes'); // ✅ added
const tmdbRoutes = require('./src/routes/tmdbRoutes');
const profileRoutes = require('./src/routes/profileRoutes.js');



const app = express();
const PORT = process.env.PORT || 5000;

const https = require('https');
const axiosInstance = axios.create({
  timeout: 60000, // 10 seconds
  httpsAgent: new https.Agent({ keepAlive: true }),
});

// TMDb API Key
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

if (!TMDB_API_KEY) {
  console.error("❌ TMDb API Key is missing! Add it to .env");
  process.exit(1);
} else {
  console.log("✅ TMDb API Key loaded successfully.");
}

// -------------------
// Middleware
// -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS setup
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://127.0.0.1:8080",
      "http://localhost:8080",
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // allow this origin
    } else {
      callback(new Error("CORS not allowed from this origin: " + origin));
    }
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
};
if (process.env.NODE_ENV === "production") {
  console.log("🌐 Running initDb in production...");
  require("./src/config/initDb");
}


app.use(cors(corsOptions)); // ✅ this is correct

// -------------------
// Serve frontend statically
// -------------------
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// This ensures frontend URLs like dashboard.html, genre.html, etc., work
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/movies') || req.path.startsWith('/search') || req.path.startsWith('/genres')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// -------------------
// Mount Routes
// -------------------
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);  // movies CRUD + favorites
app.use('/api/reviews', reviewRoutes); // ✅ reviews routes
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/profile', profileRoutes);
// -------------------
// TMDb Cache
// -------------------
const cache = {};
function getCache(key) {
  const cached = cache[key];
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    delete cache[key];
    return null;
  }
  return cached.data;
}
function setCache(key, data, ttl = 1000 * 60 * 5) {
  cache[key] = { data, expiry: Date.now() + ttl };
}

// -------------------
// Axios GET with retry
// -------------------
async function axiosGetWithRetry(url, params, retries = 1) {
  try {
    const res = await axiosInstance.get(url, { params });

    return res.data;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Retrying ${url} due to error: ${err.message}`);
      return axiosGetWithRetry(url, params, retries - 1);
    }
    throw err;
  }
}

// -------------------
// Helper to format movies
// -------------------
function formatMovies(results) {
  return results.map(movie => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster: movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null,
    backdrop: movie.backdrop_path ? TMDB_IMAGE_BASE + movie.backdrop_path : null,
    release_date: movie.release_date,
    vote_average: movie.vote_average
  }));
}

// -------------------
// TMDb Routes (fallback if needed)
// -------------------

// Get movie by ID
app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  if (!movieId) return res.status(400).json({ error: "No movie selected" });

  const cacheKey = `movie_${movieId}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const tmdbData = await axiosGetWithRetry(
      `https://api.themoviedb.org/3/movie/${movieId}`,
      { api_key: TMDB_API_KEY }
    );

    const data = {
      id: tmdbData.id,
      title: tmdbData.title,
      overview: tmdbData.overview,
      poster: tmdbData.poster_path ? TMDB_IMAGE_BASE + tmdbData.poster_path : null,
      backdrop: tmdbData.backdrop_path ? TMDB_IMAGE_BASE + tmdbData.backdrop_path : null,
      genres: tmdbData.genres.map(g => g.name),
      release_date: tmdbData.release_date,
      vote_average: tmdbData.vote_average,
      runtime: tmdbData.runtime
    };

    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("TMDb API Error (movie/:id):", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch movie data." });
  }
});

// Search movies
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const page = Number(req.query.page) || 1;

  if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });
  if (page < 1 || page > 1000) return res.status(400).json({ error: "Page must be between 1 and 1000" });

  const cacheKey = `search_${query}_${page}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const tmdbData = await axiosGetWithRetry(
      'https://api.themoviedb.org/3/search/movie',
      { api_key: TMDB_API_KEY, query, include_adult: false, page }
    );

    const data = {
      page: tmdbData.page,
      total_pages: tmdbData.total_pages,
      total_results: tmdbData.total_results,
      results: formatMovies(tmdbData.results)
    };

    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("TMDb API Error (search):", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to search movies." });
  }
});

// Popular, Top-rated, Upcoming
const movieEndpoints = [
  { path: 'popular', url: 'https://api.themoviedb.org/3/movie/popular' },
  { path: 'top-rated', url: 'https://api.themoviedb.org/3/movie/top_rated' },
  { path: 'upcoming', url: 'https://api.themoviedb.org/3/movie/upcoming' }
];

movieEndpoints.forEach(ep => {
  app.get(`/movies/${ep.path}`, async (req, res) => {
    const page = Number(req.query.page) || 1;
    if (page < 1 || page > 1000) return res.status(400).json({ error: "Page must be between 1 and 1000" });

    const cacheKey = `${ep.path}_${page}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    try {
      const tmdbData = await axiosGetWithRetry(ep.url, { api_key: TMDB_API_KEY, page });
      const data = {
        page: tmdbData.page,
        total_pages: tmdbData.total_pages,
        total_results: tmdbData.total_results,
        results: formatMovies(tmdbData.results)
      };
      setCache(cacheKey, data);
      res.json(data);
    } catch (error) {
      console.error(`TMDb API Error (${ep.path}):`, error.response?.data || error.message);
      res.status(500).json({ error: `Failed to fetch ${ep.path} movies.` });
    }
  });
});

// Homepage movies
app.get('/movies/homepage', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const cacheKey = `homepage_${page}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [popular, topRated, upcoming] = await Promise.all([
      axiosGetWithRetry('https://api.themoviedb.org/3/movie/popular', { api_key: TMDB_API_KEY, page }),
      axiosGetWithRetry('https://api.themoviedb.org/3/movie/top_rated', { api_key: TMDB_API_KEY, page }),
      axiosGetWithRetry('https://api.themoviedb.org/3/movie/upcoming', { api_key: TMDB_API_KEY, page })
    ]);

    const data = {
      popular: formatMovies(popular.results),
      top_rated: formatMovies(topRated.results),
      upcoming: formatMovies(upcoming.results)
    };

    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("TMDb API Error (homepage):", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch homepage movies." });
  }
});

// Latest movie
app.get('/movies/latest', async (req, res) => {
  const cacheKey = `latest_movie`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const tmdbData = await axiosGetWithRetry(
      'https://api.themoviedb.org/3/movie/now_playing',
      { api_key: TMDB_API_KEY, page: 1 }
    );

    if (!tmdbData.results || !tmdbData.results.length) {
      return res.status(404).json({ error: "No latest movies found." });
    }

    const latestMovie = tmdbData.results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))[0];

    const data = {
      id: latestMovie.id,
      title: latestMovie.title,
      overview: latestMovie.overview,
      poster: latestMovie.poster_path ? TMDB_IMAGE_BASE + latestMovie.poster_path : null,
      backdrop: latestMovie.backdrop_path ? TMDB_IMAGE_BASE + latestMovie.backdrop_path : null,
      release_date: latestMovie.release_date,
      vote_average: latestMovie.vote_average
    };

    setCache(cacheKey, data, 1000 * 60 * 10); // 10 mins cache
    res.json(data);
  } catch (error) {
    console.error("TMDb API Error (latest):", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch latest movie." });
  }
});

// -------------------
// GENRES ENDPOINTS
// -------------------

// Get all movie genres
app.get('/genres', async (req, res) => {
  const cacheKey = 'genres_list';
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const tmdbData = await axiosGetWithRetry(
      'https://api.themoviedb.org/3/genre/movie/list',
      { api_key: TMDB_API_KEY, language: 'en-US' }
    );
    setCache(cacheKey, tmdbData, 1000 * 60 * 60); // 1 hour cache
    res.json(tmdbData);
  } catch (error) {
    console.error("TMDb API Error (/genres):", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch genres." });
  }
});

// Get movies by genre ID
app.get('/movies/genre/:id', async (req, res) => {
  const genreId = req.params.id;
  if (!genreId) return res.status(400).json({ error: "Genre ID is required" });

  const cacheKey = `genre_${genreId}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const tmdbData = await axiosGetWithRetry(
      'https://api.themoviedb.org/3/discover/movie',
      { api_key: TMDB_API_KEY, with_genres: genreId, sort_by: 'popularity.desc' }
    );

    const results = formatMovies(tmdbData.results);

    setCache(cacheKey, { results }, 1000 * 60 * 30); // 30 mins cache
    res.json({ results });
  } catch (error) {
    console.error("TMDb API Error (/movies/genre/:id):", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch movies for genre." });
  }
});

// -------------------
// TRENDING ENDPOINTS
// -------------------

// Trending movies (Day or Week)
app.get('/movies/trending/:time_window', async (req, res) => {
  const { time_window } = req.params; // "day" or "week"
  if (!['day', 'week'].includes(time_window)) {
    return res.status(400).json({ error: "time_window must be 'day' or 'week'" });
  }

  const cacheKey = `trending_${time_window}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const tmdbData = await axiosGetWithRetry(
      `https://api.themoviedb.org/3/trending/movie/${time_window}`,
      { api_key: TMDB_API_KEY }
    );

    const data = {
      page: tmdbData.page,
      total_pages: tmdbData.total_pages,
      total_results: tmdbData.total_results,
      results: formatMovies(tmdbData.results)
    };

    setCache(cacheKey, data, 1000 * 60 * 10); // 10 mins cache
    res.json(data);
  } catch (error) {
    console.error(`TMDb API Error (trending/${time_window}):`, error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch trending movies." });
  }
});

// -------------------
// Start server
// -------------------
app.listen(PORT, () => {
  console.log("TMDb API Key:", process.env.TMDB_API_KEY);
    console.log("🌐 Running initDb in production...");
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Frontend served from ${frontendPath}`); 
});
