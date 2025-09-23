const express = require("express");
const router = express.Router();
const {
  getMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const authenticateToken = require("../middleware/authMiddleware");
const db = require("../config/db");

// -------------------------
// Movie CRUD
// -------------------------
router.get("/", getMovies);               // GET all movies
router.get("/:id", getMovieById);        // GET movie by ID
router.post("/", authenticateToken, addMovie);   // POST add movie (auth required)
router.put("/:id", authenticateToken, updateMovie); // PUT update movie (auth required)
router.delete("/:id", authenticateToken, deleteMovie); // DELETE movie (auth required)

// -------------------------
// Watchlist / Favorites
// -------------------------

// Add to favorites / watchlist
router.post("/:id/favorite", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  db.query(
    "SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?",
    [userId, movieId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length > 0)
        return res.status(400).json({ message: "Already in watchlist" });

      db.query(
        "INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)",
        [userId, movieId],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Failed to add to watchlist" });
          res.json({ message: "Added to watchlist" });
        }
      );
    }
  );
});

// Remove from favorites / watchlist
router.delete("/:id/favorite", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  db.query(
    "DELETE FROM favorites WHERE user_id = ? AND movie_id = ?",
    [userId, movieId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Not found in watchlist" });
      res.json({ message: "Removed from watchlist" });
    }
  );
});

module.exports = router;
