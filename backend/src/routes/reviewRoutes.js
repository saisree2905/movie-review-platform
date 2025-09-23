const express = require("express");
const router = express.Router();
const {
  addReview,
  getReviewsByMovie,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const authenticateToken = require("../middleware/authMiddleware");

// -------------------------
// Review Routes
// -------------------------

// Get all reviews for a specific movie
router.get("/:movieId", getReviewsByMovie);

// Add a review (authenticated)
router.post("/", authenticateToken, addReview);

// Update a review by ID (authenticated)
router.put("/:id", authenticateToken, updateReview);

// Delete a review by ID (authenticated)
router.delete("/:id", authenticateToken, deleteReview);

module.exports = router;
