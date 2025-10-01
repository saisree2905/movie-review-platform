// const db = require("../config/db");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   const { name, email, password } = req.body;
//   if(!name || !email || !password) return res.status(400).json({ error:"All fields required" });

//   db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
//     if(results.length) return res.status(400).json({ error:"Email already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     db.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", [name,email,hashedPassword], (err2, result2)=>{
//       if(err2) return res.status(500).json({ error:"Database error" });
//       res.status(201).json({ message:"User registered successfully" });
//     });
//   });
// };

// exports.login = (req, res) => {
//   const { email, password } = req.body;
//   if(!email || !password) return res.status(400).json({ error:"All fields required" });

//   db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
//     if(!results.length) return res.status(400).json({ error:"Invalid credentials" });

//     const user = results[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if(!isMatch) return res.status(400).json({ error:"Invalid credentials" });

//     const token = jwt.sign({ id:user.id }, process.env.JWT_SECRET, { expiresIn:"1d" });
//     res.json({ token, name: user.name, email: user.email });
//   });
// };

// exports.getDashboard = (req,res)=>{
//   const userId = req.user.id;

//   db.query("SELECT id,name,email FROM users WHERE id = ?", [userId], (err,userResults)=>{
//     if(err || !userResults.length) return res.status(500).json({ error:"User not found" });
//     const user = userResults[0];

//     db.query("SELECT r.review, r.rating, m.title as movie_title FROM reviews r JOIN movies m ON r.movie_id = m.id WHERE r.user_id = ?", [userId], (err2,reviews)=>{
//       if(err2) return res.status(500).json({ error:"Failed to fetch reviews" });

//       db.query("SELECT m.title, m.poster FROM favorites f JOIN movies m ON f.movie_id = m.id WHERE f.user_id = ?", [userId], (err3,favorites)=>{
//         if(err3) return res.status(500).json({ error:"Failed to fetch favorites" });

//         res.json({
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           reviews,
//           favorites
//         });
//       });
//     });
//   });
// };


// const db = require("../config/db");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password) 
//     return res.status(400).json({ error: "All fields required" });

//   db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
//     if (err) {
//       console.error("DB error (register select):", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (results && results.length) 
//       return res.status(400).json({ error: "Email already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     db.query(
//       "INSERT INTO users (name,email,password) VALUES (?,?,?)",
//       [name, email, hashedPassword],
//       (err2, result2) => {
//         if (err2) {
//           console.error("DB error (register insert):", err2);
//           return res.status(500).json({ error: "Database error" });
//         }
//         res.status(201).json({ message: "User registered successfully" });
//       }
//     );
//   });
// };

// exports.login = (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) 
//     return res.status(400).json({ error: "All fields required" });

//   db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
//     if (err) {
//       console.error("DB error (login select):", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (!results || !results.length) 
//       return res.status(400).json({ error: "Invalid credentials" });

//     const user = results[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     res.json({ token, name: user.name, email: user.email });
//   });
// };

// exports.getDashboard = (req, res) => {
//   const userId = req.user.id;

//   db.query("SELECT id,name,email FROM users WHERE id = ?", [userId], (err, userResults) => {
//     if (err) {
//       console.error("DB error (getDashboard user):", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     if (!userResults || !userResults.length) 
//       return res.status(404).json({ error: "User not found" });

//     const user = userResults[0];

//     db.query(
//       "SELECT r.review, r.rating, m.title as movie_title FROM reviews r JOIN movies m ON r.movie_id = m.id WHERE r.user_id = ?",
//       [userId],
//       (err2, reviews) => {
//         if (err2) {
//           console.error("DB error (getDashboard reviews):", err2);
//           return res.status(500).json({ error: "Failed to fetch reviews" });
//         }

//         db.query(
//           "SELECT m.title, m.poster FROM favorites f JOIN movies m ON f.movie_id = m.id WHERE f.user_id = ?",
//           [userId],
//           (err3, favorites) => {
//             if (err3) {
//               console.error("DB error (getDashboard favorites):", err3);
//               return res.status(500).json({ error: "Failed to fetch favorites" });
//             }

//             res.json({
//               id: user.id,
//               name: user.name,
//               email: user.email,
//               reviews,
//               favorites,
//             });
//           }
//         );
//       }
//     );
//   });
// };



// // authController.js
// const db = require("../config/db"); // pool.promise()
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) 
//       return res.status(400).json({ error: "All fields required" });

//     // Check if user exists
//     const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
//     if (existingUsers.length) 
//       return res.status(400).json({ error: "Email already exists" });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user
//     await db.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", [name, email, hashedPassword]);
//     res.status(201).json({ message: "User registered successfully" });

//   } catch (err) {
//     console.error("DB error (register):", err);
//     res.status(500).json({ error: "Database error" });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) 
//       return res.status(400).json({ error: "All fields required" });

//     // Get user
//     const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
//     if (!results.length) 
//       return res.status(400).json({ error: "Invalid credentials" });

//     const user = results[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     res.json({ token, name: user.name, email: user.email });

//   } catch (err) {
//     console.error("DB error (login):", err);
//     res.status(500).json({ error: "Database error" });
//   }
// };

// exports.getDashboard = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [userResults] = await db.query("SELECT id,name,email FROM users WHERE id = ?", [userId]);
//     if (!userResults.length) return res.status(404).json({ error: "User not found" });

//     const user = userResults[0];

//     const [reviews] = await db.query(
//       "SELECT r.review, r.rating, m.title as movie_title FROM reviews r JOIN movies m ON r.movie_id = m.id WHERE r.user_id = ?",
//       [userId]
//     );

//     const [favorites] = await db.query(
//       "SELECT m.title, m.poster FROM favorites f JOIN movies m ON f.movie_id = m.id WHERE f.user_id = ?",
//       [userId]
//     );

//     res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       reviews,
//       favorites,
//     });

//   } catch (err) {
//     console.error("DB error (getDashboard):", err);
//     res.status(500).json({ error: "Database error" });
//   }
// };





// authController.js
const db = require("../config/db"); // pool.promise()
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if user exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", [name, email, hashedPassword]);
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("❌ DB error (register):", err); // full error
    res.status(500).json({
      error: "Database error",
      details: err.message,   // send short detail to frontend
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Get user
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!results.length) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, name: user.name, email: user.email });

  } catch (err) {
    console.error("❌ DB error (login):", err); // full error
    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [userResults] = await db.query("SELECT id,name,email FROM users WHERE id = ?", [userId]);
    if (!userResults.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResults[0];

    const [reviews] = await db.query(
      "SELECT r.review, r.rating, m.title as movie_title FROM reviews r JOIN movies m ON r.movie_id = m.id WHERE r.user_id = ?",
      [userId]
    );

    const [favorites] = await db.query(
      "SELECT m.title, m.poster FROM favorites f JOIN movies m ON f.movie_id = m.id WHERE f.user_id = ?",
      [userId]
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      reviews,
      favorites,
    });

  } catch (err) {
    console.error("❌ DB error (getDashboard):", err); // full error
    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  }
};
