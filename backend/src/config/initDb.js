// initDb.js
const db = require('./db');


const queries = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  // Contact table
  `CREATE TABLE IF NOT EXISTS contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  // Movie table
  `CREATE TABLE IF NOT EXISTS movie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_date DATE,
    poster_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    release_year YEAR
  );`,
  // Favourites table
  `CREATE TABLE IF NOT EXISTS favourites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
  );`,
  // Reviews table
  `CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
  );`
];

(async () => {
  try {
    for (const query of queries) {
      await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    console.log("✅ All tables created successfully!");

    // Insert a test user if not exists
    const testEmail = "test@example.com";
    const testPassword = "123456"; // plain password
    const testName = "Test User";

    db.query(
      `INSERT IGNORE INTO users (name, email, password) VALUES (?, ?, ?)`,
      [testName, testEmail, testPassword],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting test user:", err.message);
        } else {
          console.log("✅ Test user inserted (if not exists):", testEmail);
        }
        db.end();
      }
    );

  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
    db.end();
  }
})();
