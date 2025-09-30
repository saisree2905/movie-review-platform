const mysql = require("mysql2");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.local" : ".env"
});

// Create a connection pool for better reliability in production
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : null
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1); // Exit server if DB is unreachable
  }
  console.log("✅ Connected to MySQL database!");
  if (connection) connection.release(); // release back to pool
});

module.exports = db;
