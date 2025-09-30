// db.js
const mysql = require("mysql2");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.local" : ".env"
});

// Pool config
const poolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // number of connections in pool
  queueLimit: 0,
};

// Enable SSL for Render
if (process.env.NODE_ENV === "production") {
  poolOptions.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(poolOptions);

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database!");
  connection.release();
});

module.exports = db.promise(); // Use promise wrapper for async/await
