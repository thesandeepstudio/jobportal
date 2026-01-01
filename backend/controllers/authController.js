const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================
// REGISTER FUNCTION
// =====================
exports.register = async (req, res) => {
  const {
    role,
    email,
    password,
    mobile,
    first_name,
    last_name,
    company_name,
    company_size,
    industry,
    location,
  } = req.body;

  // Check if email already exists
  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.json({ status: false, message: "Database error" });

      if (result.length > 0) {
        return res.json({ status: false, message: "Email already registered" });
      }

      // Hash password
      const hash = await bcrypt.hash(password, 10);

      // Insert user into users table
      db.query(
        "INSERT INTO users(email,password,role,mobile) VALUES(?,?,?,?)",
        [email, hash, role, mobile],
        (err, user) => {
          if (err) {
            return res.json({ status: false, message: "Error creating user" });
          }

          const userId = user.insertId;

          // Insert additional info based on role
          if (role === "jobseeker") {
            insertJobSeeker(userId);
          } else {
            insertEmployer(userId);
          }
        }
      );
    }
  );

  function insertJobSeeker(userId) {
    db.query(
      "INSERT INTO jobseekers(first_name,last_name,user_id) VALUES(?,?,?)",
      [first_name, last_name, userId],
      (err) => {
        if (err) return res.json({ status: false, message: "Error jobseeker" });
        res.json({ status: true, message: "Job Seeker registered!" });
      }
    );
  }

  function insertEmployer(userId) {
    db.query(
      `INSERT INTO employers 
        (company_name,company_size,industry,location,user_id)
        VALUES (?,?,?,?,?)`,
      [company_name, company_size, industry, location, userId],
      (err) => {
        if (err) return res.json({ status: false, message: "Error employer" });
        res.json({ status: true, message: "Employer registered!" });
      }
    );
  }
};

// =====================
// LOGIN FUNCTION
// =====================
exports.login = (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    return res.json({ status: false, message: "Email and password are required" });
  }

  // 2️⃣ Find user in DB
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.json({ status: false, message: "Database error" });

    if (result.length === 0) {
      return res.json({ status: false, message: "Invalid email or password" });
    }

    const user = result[0];

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: false, message: "Invalid email or password" });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ Send response
    res.json({
      status: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  });
};
