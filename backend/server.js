require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");

const db = require("./config/db");

const app = express();

/* ----------------- MIDDLEWARE ----------------- */
app.use(
  cors({
    origin: "http://localhost:5000", // change if frontend runs elsewhere
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "admin_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true if HTTPS
  })
);

/* ----------------- STATIC FILES ----------------- */
app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));
app.use("/auth", express.static(path.join(__dirname, "../frontend/auth")));
app.use("/assets", express.static(path.join(__dirname, "../frontend/Assets")));
app.use(express.static(path.join(__dirname, "../frontend")));

/* ----------------- ROUTES ----------------- */
app.get("/", (req, res) => {
  res.send("Backend working!");
});

/* ----------------- ADMIN LOGIN ----------------- */
app.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = 'admin'",
      [username]
    );

    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    req.session.admin = admin.id;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ----------------- ADMIN DASHBOARD ----------------- */
app.get("/admin/dashboard.html", (req, res, next) => {
  if (!req.session.admin) return res.redirect("/admin/login.html");
  next();
});

// Logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login.html");
});

// Dashboard data: total users and companies
app.get("/admin/total-users", async (req, res) => {
  try {
    if (!req.session.admin)
      return res.status(401).json({ message: "Unauthorized" });

    const [rows] = await db.query(
      "SELECT SUM(role='jobseeker') AS total_users, SUM(role='employer') AS total_companies FROM users"
    );

    res.json({
      users: rows[0].total_users,
      companies: rows[0].total_companies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard data: recent users
app.get("/admin/recent-users", async (req, res) => {
  try {
    if (!req.session.admin)
      return res.status(401).json({ message: "Unauthorized" });

    const [rows] = await db.query(
      `SELECT id, email, role, mobile, created_at
       FROM users
       ORDER BY id DESC
       LIMIT 10`
    );

    res.json(rows); // send last 10 users
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------- START SERVER ----------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
