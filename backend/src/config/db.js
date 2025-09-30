const mysql = require("mysql2");
require("dotenv").config();

const poolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (process.env.NODE_ENV === "production") {
  poolOptions.ssl = false; // important
}

const pool = mysql.createPool(poolOptions);

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database!");
  connection.release();
});

module.exports = pool.promise();
