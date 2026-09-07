const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST.trim(),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  ssl: {
    rejectUnauthorized: true
  }
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }

  console.log("Aiven MySQL connected successfully!");
});

module.exports = db;