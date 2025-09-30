// initDb.js
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.local" : ".env"
});

// MySQL connection options
const dbOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// If Render requires SSL, add this
if (process.env.NODE_ENV === "production") {
  dbOptions.ssl = { rejectUnauthorized: false };
}

const db = mysql.createConnection(dbOptions);

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database!");
});

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
    release_year YEAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Insert test user with hashed password
    const testEmail = "test@example.com";
    const testPassword = "123456";
    const testName = "Test User";
    const hashedPassword = bcrypt.hashSync(testPassword, 10);

    await new Promise((resolve, reject) => {
      db.query(
        `INSERT IGNORE INTO users (name, email, password) VALUES (?, ?, ?)`,
        [testName, testEmail, hashedPassword],
        (err, result) => {
          if (err) return reject(err);
          console.log("✅ Test user inserted (if not exists):", testEmail);
          resolve(result);
        }
      );
    });

    db.end();
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
    db.end();
    process.exit(1);
  }
})();
