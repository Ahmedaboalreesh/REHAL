const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// PostgreSQL connection
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1');
    res.json({ ok: true, db: rows[0]['?column?'] === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      userType,
      district,
      affiliation,
      password
    } = req.body || {};

    // Basic validation
    if (!fullName || !email || !phone || !userType || !district || !affiliation || !password) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    if (!/^05\d{8}$/.test(phone)) {
      return res.status(400).json({ ok: false, error: 'Invalid phone format' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO users (full_name, email, phone, user_type, district, affiliation, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name AS fullName, email, user_type AS userType, district, affiliation, created_at AS createdAt;
    `;

    const values = [fullName, email.toLowerCase(), phone, userType, district, affiliation, passwordHash];

    const { rows } = await pool.query(insertSql, values);

    res.status(201).json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    if (err && err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'Email or phone already exists' });
    }
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


