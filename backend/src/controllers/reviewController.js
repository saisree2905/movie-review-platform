const db = require("../config/db");

// -------------------------
// Add Review
// -------------------------
exports.addReview = (req, res) => {
  const user_id = req.user.id; // user ID from authMiddleware
  const { movie_id, rating, comment } = req.body;

  if (!movie_id || !rating) 
    return res.status(400).json({ error: "movie_id and rating are required" });

  db.query(
    "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)",
    [user_id, movie_id, rating, comment || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to add review", details: err.message });
      res.status(201).json({ message: "Review added successfully", reviewId: result.insertId });
    }
  );
};

// -------------------------
// Get Reviews by Movie
// -------------------------
exports.getReviewsByMovie = (req, res) => {
  const { movieId } = req.params; // match route param

  db.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
     FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.movie_id = ? 
     ORDER BY r.created_at DESC`,
    [movieId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to fetch reviews", details: err.message });
      res.json(result);
    }
  );
};

// -------------------------
// Update Review
// -------------------------
exports.updateReview = (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  db.query(
    "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
    [rating, comment, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update review", details: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Review not found" });
      res.json({ message: "Review updated successfully" });
    }
  );
};

// -------------------------
// Delete Review
// -------------------------
exports.deleteReview = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM reviews WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete review", details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  });
};
