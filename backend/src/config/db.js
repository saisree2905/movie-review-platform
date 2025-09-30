// db.js
const mysql = require("mysql2");
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

// Enable SSL for Render production MySQL
if (process.env.NODE_ENV === "production") {
  dbOptions.ssl = { rejectUnauthorized: false };
}

const db = mysql.createConnection(dbOptions);

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
  console.log("✅ Connected to MySQL database!");
});

module.exports = db;
