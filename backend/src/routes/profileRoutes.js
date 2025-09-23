// backend/src/routes/profileRoutes.js
const express = require("express");
const db = require("../config/db.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// GET /api/profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const [user] = await db.query(
      "SELECT id, username, email, tagline, about, avatar FROM users WHERE id = ?",
      [userId]
    );

    // Get stats
    const [[stats]] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM watched WHERE user_id = ?) AS moviesWatched,
        (SELECT COUNT(*) FROM reviews WHERE user_id = ?) AS reviewsWritten,
        (SELECT COUNT(*) FROM watchlist WHERE user_id = ?) AS watchlist`,
      [userId, userId, userId]
    );

    // Get recent activity
    const [activity] = await db.query(
      `SELECT 'review' AS type, CONCAT('Reviewed "', m.title, '" – ', r.rating, ' Stars') AS detail, r.created_at AS date
       FROM reviews r JOIN movies m ON r.movie_id = m.id WHERE r.user_id = ?
       UNION
       SELECT 'watchlist' AS type, CONCAT('Added "', m.title, '" to Watchlist') AS detail, w.created_at AS date
       FROM watchlist w JOIN movies m ON w.movie_id = m.id WHERE w.user_id = ?
       ORDER BY date DESC LIMIT 10`,
      [userId, userId]
    );

    res.json({ user, stats, activity });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

module.exports = router;
