// src/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { Pool } = pkg;
const app = express();
const port = 5000;

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sideline_au_db",
  password: "123kurt",
  port: 5432,
});

// Ensure uploads folder exists
import fs from "fs";
const uploadsDir = join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profilePic-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// -------------------- USER ENDPOINTS -------------------- //

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password) VALUES ($1,$2,$3,$4,$5)`,
      [firstName, lastName, email, phone || null, password]
    );

    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = userResult.rows[0];
    if (user.password !== password) return res.status(400).json({ error: "Invalid password" });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profile_pic || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch profile
app.get("/api/profile", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const userResult = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, phone, profile_pic AS "profilePic" FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user: userResult.rows[0] });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload/update profile picture
app.post("/api/profile/pic", upload.single("profilePic"), async (req, res) => {
  try {
    const storedUser = JSON.parse(req.body.user);
    if (!storedUser || !storedUser.email) return res.status(400).json({ error: "User not found" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = `/uploads/${req.file.filename}`;

    await pool.query("UPDATE users SET profile_pic=$1 WHERE email=$2", [filePath, storedUser.email]);
    res.status(200).json({ message: "Profile picture updated", profilePic: filePath });
  } catch (err) {
    console.error("Profile pic upload error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- JOBS ENDPOINTS -------------------- //

// Create a new job
// -------------------- JOBS ENDPOINTS -------------------- //

// Create a new job
app.post("/api/jobs", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills = [],
      jobType,
      location,
      duration,
      startDate,
      paymentType,
      minBudget,
      maxBudget,
      currency,
      contact_email,
      deadline,
      screeningQuestions = [],
      termsAccepted
    } = req.body;

    // Required fields check
    if (!title || !description || !category || !jobType || !duration || !paymentType || !contact_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert optional numeric fields
    const minBudgetNum = minBudget ? Number(minBudget) : null;
    const maxBudgetNum = maxBudget ? Number(maxBudget) : null;

    // Convert optional date fields
    const startDateVal = startDate ? new Date(startDate) : null;
    const deadlineVal = deadline ? new Date(deadline) : null;

    const result = await pool.query(
      `INSERT INTO jobs
        (title, description, category, skills, job_type, location, duration, start_date, payment_type, min_budget, max_budget, currency, contact_email, deadline, screening_questions, terms_accepted)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        title,
        description,
        category,
        JSON.stringify(skills),
        jobType,
        location || null,
        duration,
        startDateVal,
        paymentType,
        minBudgetNum,
        maxBudgetNum,
        currency || null,
        contact_email,
        deadlineVal,
        JSON.stringify(screeningQuestions),
        termsAccepted || false
      ]
    );

    res.status(201).json({ message: "Job posted successfully", job: result.rows[0] });
  } catch (err) {
    console.error("Job posting error:", err);
    res.status(500).json({ error: err.message }); // <-- send actual error for debugging
  }
});

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
    const jobs = result.rows.map(job => {
      let skills = [], screening_questions = [];
      try { skills = job.skills ? JSON.parse(job.skills) : []; } catch { skills = []; }
      try { screening_questions = job.screening_questions ? JSON.parse(job.screening_questions) : []; } catch { screening_questions = []; }

      return { ...job, skills, screening_questions };
    });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ error: err.message });
  }
});
// 🔍 Search jobs by title, description, skills, or category
// 🔍 Search jobs by title, category, or skills
app.get('/api/jobs/search', async (req, res) => {
  const q = req.query.q;

  try {
    const result = await pool.query(
      `SELECT * FROM jobs 
       WHERE LOWER(title) LIKE LOWER($1) 
          OR LOWER(description) LIKE LOWER($1) 
          OR LOWER(category) LIKE LOWER($1)
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );

    res.json(result.rows); // ✅ Always return an array
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
    const jobs = result.rows.map(job => {
      // safely parse JSON fields
      let skills = [];
      let screening_questions = [];
      try { skills = job.skills ? JSON.parse(job.skills) : []; } catch { skills = []; }
      try { screening_questions = job.screening_questions ? JSON.parse(job.screening_questions) : []; } catch { screening_questions = []; }

      return {
        ...job,
        skills,
        screening_questions
      };
    });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get job by ID
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM jobs WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });

    const job = result.rows[0];
    try { job.skills = job.skills ? JSON.parse(job.skills) : []; } catch { job.skills = []; }
    try { job.screening_questions = job.screening_questions ? JSON.parse(job.screening_questions) : []; } catch { job.screening_questions = []; }

    res.status(200).json(job);
  } catch (err) {
    console.error("Get job by ID error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- STATIC FILES -------------------- //
app.use("/uploads", express.static(uploadsDir));

// -------------------- START SERVER -------------------- //
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
