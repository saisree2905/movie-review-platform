const mysql = require("mysql2");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.local" : ".env"
});

// Use environment variables for MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database!");
});

module.exports = db;
