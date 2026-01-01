// authController.js
const db = require("../config/db"); // make sure this is mysql2/promise
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

  try {
    // 1️⃣ Check if email already exists
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.json({ status: false, message: "Email already registered" });
    }

    // 2️⃣ Hash password
    const hash = await bcrypt.hash(password, 10);

    // 3️⃣ Insert user into users table
    const [result] = await db.execute(
      "INSERT INTO users(email, password, role, mobile) VALUES(?,?,?,?)",
      [email, hash, role, mobile]
    );

    const userId = result.insertId;

    // 4️⃣ Insert additional info based on role
    if (role === "jobseeker") {
      await db.execute(
        "INSERT INTO jobseekers(first_name, last_name, user_id) VALUES(?,?,?)",
        [first_name, last_name, userId]
      );
      return res.json({ status: true, message: "Job Seeker registered!" });
    } else if (role === "employer") {
      await db.execute(
        `INSERT INTO employers(company_name, company_size, industry, location, user_id)
         VALUES(?,?,?,?,?)`,
        [company_name, company_size, industry, location, userId]
      );
      return res.json({ status: true, message: "Employer registered!" });
    } else if (role === "admin") {
      // Optional: you can allow admin registration here if needed
      return res.json({ status: true, message: "Admin registered!" });
    } else {
      return res.json({ status: false, message: "Invalid role" });
    }
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: "Database error" });
  }
};

// =====================
// LOGIN FUNCTION
// =====================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    return res.json({
      status: false,
      message: "Email and password are required",
    });
  }

  try {
    // 2️⃣ Find user in DB
    const [rows] = await db.execute(
      "SELECT id, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.json({ status: false, message: "Invalid email or password" });
    }

    const user = rows[0];

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: false, message: "Invalid email or password" });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "1d" }
    );

    // 5️⃣ Send response with role
    return res.json({
      status: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: "Server error" });
  }
};
