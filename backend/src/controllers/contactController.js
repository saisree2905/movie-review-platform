const Contact = require('../models/contact');

// Submit contact form
exports.submitContact = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Save to DB using Contact model
  Contact.create({ name, email, message }, (err, result) => {
    if (err) {
      console.error("DB Insert Error:", err);
      return res.status(500).json({ error: "Failed to save message to database" });
    }

    return res.status(200).json({ message: "Message sent successfully ✅" });
  });
};
