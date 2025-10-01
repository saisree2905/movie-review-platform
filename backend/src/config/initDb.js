// initDb.js
const db = require("./db"); // use promise pool
const bcrypt = require("bcryptjs");

const queries = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_date DATE,
    poster VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    release_year YEAR
  );`,
  `CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
  );`,
];

async function initDb() {
  try {
    for (const query of queries) {
      await db.query(query);
    }
    console.log("✅ All tables created successfully!");

    const testEmail = "test@example.com";
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [testEmail]);

    if (!existing.length) {
      const testPassword = await bcrypt.hash("123456", 10);
      await db.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", [
        "Test User",
        testEmail,
        testPassword,
      ]);
      console.log("✅ Test user inserted:", testEmail);
    } else {
      console.log("ℹ️ Test user already exists:", testEmail);
    }

  } catch (err) {
    console.error("❌ Error initializing DB:", err);
  }
}

module.exports = initDb;
