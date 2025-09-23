const db = require("../config/db");

// Get all movies
exports.getMovies = (req, res) => {
  db.query("SELECT * FROM movies", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Get movie by ID
exports.getMovieById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM movies WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "Movie not found" });
    res.json(result[0]);
  });
};

// Add new movie
exports.addMovie = (req, res) => {
  const { title, description, release_year } = req.body;
  if (!title || !description || !release_year)
    return res.status(400).json({ error: "All fields are required" });

  db.query(
    "INSERT INTO movies (title, description, release_year) VALUES (?, ?, ?)",
    [title, description, release_year],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Movie added successfully", movieId: result.insertId });
    }
  );
};

// Update movie
exports.updateMovie = (req, res) => {
  const { id } = req.params;
  const { title, description, release_year } = req.body;
  if (!title || !description || !release_year)
    return res.status(400).json({ error: "All fields are required" });

  db.query(
    "UPDATE movies SET title = ?, description = ?, release_year = ? WHERE id = ?",
    [title, description, release_year, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Movie not found" });
      res.json({ message: "Movie updated successfully" });
    }
  );
};

// Delete movie
exports.deleteMovie = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM movies WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  });
};
