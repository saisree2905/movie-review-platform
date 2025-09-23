const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if(!name || !email || !password) return res.status(400).json({ error:"All fields required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if(results.length) return res.status(400).json({ error:"Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", [name,email,hashedPassword], (err2, result2)=>{
      if(err2) return res.status(500).json({ error:"Database error" });
      res.status(201).json({ message:"User registered successfully" });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error:"All fields required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if(!results.length) return res.status(400).json({ error:"Invalid credentials" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ error:"Invalid credentials" });

    const token = jwt.sign({ id:user.id }, process.env.JWT_SECRET, { expiresIn:"1d" });
    res.json({ token, name: user.name, email: user.email });
  });
};

exports.getDashboard = (req,res)=>{
  const userId = req.user.id;

  db.query("SELECT id,name,email FROM users WHERE id = ?", [userId], (err,userResults)=>{
    if(err || !userResults.length) return res.status(500).json({ error:"User not found" });
    const user = userResults[0];

    db.query("SELECT r.review, r.rating, m.title as movie_title FROM reviews r JOIN movies m ON r.movie_id = m.id WHERE r.user_id = ?", [userId], (err2,reviews)=>{
      if(err2) return res.status(500).json({ error:"Failed to fetch reviews" });

      db.query("SELECT m.title, m.poster FROM favorites f JOIN movies m ON f.movie_id = m.id WHERE f.user_id = ?", [userId], (err3,favorites)=>{
        if(err3) return res.status(500).json({ error:"Failed to fetch favorites" });

        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          reviews,
          favorites
        });
      });
    });
  });
};
