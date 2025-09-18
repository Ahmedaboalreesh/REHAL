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
    console.error('Health check error:', err);
    res.status(500).json({ ok: false, error: 'DB connection failed: ' + err.message });
  }
});

// Test database tables
app.get('/api/test-db', async (req, res) => {
  try {
    const usersTable = await pool.query('SELECT COUNT(*) FROM users');
    const ownersTable = await pool.query('SELECT COUNT(*) FROM owners');
    res.json({ 
      ok: true, 
      users: usersTable.rows[0].count,
      owners: ownersTable.rows[0].count
    });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ ok: false, error: 'DB test failed: ' + err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
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
      console.log('Missing fields:', { fullName, email, phone, userType, district, affiliation, password: !!password });
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    if (!/^05\d{8}$/.test(phone)) {
      console.log('Invalid phone format:', phone);
      return res.status(400).json({ ok: false, error: 'Invalid phone format' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO users (full_name, email, phone, user_type, district, affiliation, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name AS fullName, email, user_type AS userType, district, affiliation, created_at AS createdAt;
    `;

    const values = [fullName, email.toLowerCase(), phone, userType, district, affiliation, passwordHash];
    console.log('Executing query with values:', values.map((v, i) => i === 6 ? '[HASHED]' : v));

    const { rows } = await pool.query(insertSql, values);
    console.log('User created successfully:', rows[0]);

    res.status(201).json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    if (err && err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'Email or phone already exists' });
    }
    if (err && err.code === '42P01') {
      return res.status(500).json({ ok: false, error: 'Database table not found. Please run: npm run init:db' });
    }
    res.status(500).json({ ok: false, error: 'Internal server error: ' + err.message });
  }
});

app.post('/api/owners/register', async (req, res) => {
  try {
    const {
      ownerName,
      company,
      email,
      phone,
      plateNumber,
      capacity,
      licenseNumber,
      licenseExpiry,
      password
    } = req.body || {};

    if (!ownerName || !email || !phone || !plateNumber || !capacity || !licenseNumber || !licenseExpiry || !password) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }
    if (!/^05\d{8}$/.test(phone)) {
      return res.status(400).json({ ok: false, error: 'Invalid phone format' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }
    if (Number.isNaN(Number(capacity)) || capacity < 4 || capacity > 20) {
      return res.status(400).json({ ok: false, error: 'Invalid capacity' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO owners (owner_name, company, email, phone, plate_number, capacity, license_number, license_expiry, password_hash)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id, owner_name AS ownerName, email, phone, company, plate_number AS plateNumber, capacity, status, created_at AS createdAt;
    `;
    const values = [ownerName, company || null, email.toLowerCase(), phone, plateNumber, capacity, licenseNumber, licenseExpiry, passwordHash];
    const { rows } = await pool.query(sql, values);
    res.status(201).json({ ok: true, owner: rows[0] });
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


