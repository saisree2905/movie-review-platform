const db = require('../config/db'); // Your existing MySQL connection

const Contact = {
  create: (data, callback) => {
    const { name, email, message } = data;

    // Ensure all fields are provided
    if (!name || !email || !message) {
      return callback(new Error("All fields are required"));
    }

    const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], callback);
  }
};

module.exports = Contact;
