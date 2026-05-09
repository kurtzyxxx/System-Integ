import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sql from './db.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// ─── CORS Configuration ─────────────────────────────────────
// Allow frontend origins from env (comma-separated) or default to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
}));

app.use(express.json({ limit: '10mb' }));

// ─── Static Files ────────────────────────────────────────────
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve the uploads directory statically so frontend can fetch images
app.use('/uploads', express.static(uploadDir));

// ─── Multer Config ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
    }
  }
});

// ─── Initialize Database Tables ──────────────────────────────
async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure role column exists for older tables
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student'`;

    // Create the separate profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        bio TEXT,
        major VARCHAR(255),
        school VARCHAR(255),
        avatar_url VARCHAR(512),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure the avatar_url column exists if the table was created previously
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512)`;

    console.log('Database initialized (users, profiles, roles checked/created)');
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
  }
}

initDb();

// ─── Utility: Validate Email Format ─────────────────────────
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({
      status: 'ok',
      message: 'Backend is running and connected to Supabase!',
      dbTime: result[0].now,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
    });
  }
});

// ─── Root Route ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Study Planner API is running!',
    version: '1.1.0',
    endpoints: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      changePassword: 'POST /api/auth/change-password',
      updateName: 'POST /api/auth/update-name',
      getProfile: 'GET /api/profile/:userId',
      updateProfile: 'POST /api/profile/:userId',
      uploadAvatar: 'POST /api/profile/:userId/avatar',
      adminStats: 'GET /api/admin/stats',
      adminUsers: 'GET /api/admin/users',
      adminDeleteUser: 'DELETE /api/admin/users/:id',
    },
  });
});

// ─── Register Endpoint ───────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // Validate required fields
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  // Validate username length and format
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
  }

  try {
    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} OR username = ${username.toLowerCase()}
    `;
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const newUser = await sql`
      INSERT INTO users (full_name, username, email, password)
      VALUES (${fullName.trim()}, ${username.trim().toLowerCase()}, ${email.trim().toLowerCase()}, ${hashedPassword})
      RETURNING id, username, email, full_name
    `;

    // Initialize an empty profile for the new user
    await sql`
      INSERT INTO profiles (user_id) VALUES (${newUser[0].id})
    `;

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        fullName: newUser[0].full_name,
        role: 'student',
      },
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ─── Login Endpoint ──────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password, email } = req.body;
  const loginIdentifier = email || username;

  if (!loginIdentifier || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required' });
  }

  try {
    const isEmail = loginIdentifier.includes('@');
    const normalizedIdentifier = loginIdentifier.trim().toLowerCase();

    let users;
    if (isEmail) {
      users = await sql`SELECT * FROM users WHERE email = ${normalizedIdentifier}`;
    } else {
      users = await sql`SELECT * FROM users WHERE username = ${normalizedIdentifier}`;
    }

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role || 'student',
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ─── Change Password Endpoint ────────────────────────────────
app.post('/api/auth/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password in db
    await sql`UPDATE users SET password = ${hashedNewPassword} WHERE id = ${userId}`;

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// ─── Update Name Endpoint ────────────────────────────────────
app.post('/api/auth/update-name', async (req, res) => {
  const { userId, newName } = req.body;

  if (!userId || !newName) {
    return res.status(400).json({ message: 'User ID and new name are required' });
  }

  if (newName.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }

  try {
    const updatedUser = await sql`
      UPDATE users 
      SET full_name = ${newName.trim()} 
      WHERE id = ${userId}
      RETURNING id, username, email, full_name
    `;

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Name updated successfully',
      user: {
        id: updatedUser[0].id,
        username: updatedUser[0].username,
        email: updatedUser[0].email,
        fullName: updatedUser[0].full_name,
      },
    });
  } catch (err) {
    console.error('Update name error:', err.message);
    res.status(500).json({ message: 'Server error while updating name' });
  }
});

// ─── Get Profile Endpoint ────────────────────────────────────
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const profiles = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
    if (profiles.length === 0) {
      // Auto-create profile if it doesn't exist
      const newProfile = await sql`
        INSERT INTO profiles (user_id) VALUES (${userId}) RETURNING *
      `;
      return res.status(200).json(newProfile[0]);
    }
    res.status(200).json(profiles[0]);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// ─── Update Profile Endpoint ─────────────────────────────────
app.post('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { bio, major, school } = req.body;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const updatedProfile = await sql`
      INSERT INTO profiles (user_id, bio, major, school, updated_at)
      VALUES (${userId}, ${bio || ''}, ${major || ''}, ${school || ''}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        bio = EXCLUDED.bio, 
        major = EXCLUDED.major, 
        school = EXCLUDED.school,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile[0],
    });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// ─── Upload Avatar Endpoint ──────────────────────────────────
app.post('/api/profile/:userId/avatar', upload.single('avatar'), async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  try {
    const avatarUrl = `/uploads/${req.file.filename}`;

    await sql`
      INSERT INTO profiles (user_id, avatar_url, updated_at)
      VALUES (${userId}, ${avatarUrl}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        avatar_url = EXCLUDED.avatar_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl,
    });
  } catch (err) {
    console.error('Error uploading avatar:', err.message);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
});

// ─── Admin Middleware ─────────────────────────────────────────
async function requireAdmin(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const users = await sql`SELECT role FROM users WHERE id = ${parseInt(userId)}`;
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error checking admin status' });
  }
}

// ─── Admin: Get System Stats ─────────────────────────────────
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await sql`SELECT COUNT(*)::int as count FROM users`;
    const totalProfiles = await sql`SELECT COUNT(*)::int as count FROM profiles WHERE bio IS NOT NULL OR major IS NOT NULL`;
    const recentUsers = await sql`SELECT COUNT(*)::int as count FROM users WHERE created_at > NOW() - INTERVAL '7 days'`;
    const adminCount = await sql`SELECT COUNT(*)::int as count FROM users WHERE role = 'admin'`;

    res.json({
      totalUsers: totalUsers[0].count,
      completedProfiles: totalProfiles[0].count,
      newUsersThisWeek: recentUsers[0].count,
      adminCount: adminCount[0].count,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// ─── Admin: Get All Users ────────────────────────────────────
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await sql`
      SELECT u.id, u.full_name, u.username, u.email, u.role, u.created_at,
             p.bio, p.major, p.school, p.avatar_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `;
    res.json(users.map(u => ({
      id: u.id,
      fullName: u.full_name,
      username: u.username,
      email: u.email,
      role: u.role || 'student',
      createdAt: u.created_at,
      bio: u.bio,
      major: u.major,
      school: u.school,
      avatarUrl: u.avatar_url,
    })));
  } catch (err) {
    console.error('Admin users error:', err.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// ─── Admin: Delete User ──────────────────────────────────────
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const adminId = parseInt(req.headers['x-user-id'] || req.query.userId);

  if (targetId === adminId) {
    return res.status(400).json({ message: 'Cannot delete your own admin account' });
  }

  try {
    const result = await sql`DELETE FROM users WHERE id = ${targetId} RETURNING id`;
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin delete error:', err.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// ─── Admin: Change User Role ─────────────────────────────────
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const adminId = parseInt(req.headers['x-user-id'] || req.query.userId);
  const { role } = req.body;

  if (!role || !['admin', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Role must be "admin" or "student"' });
  }

  if (targetId === adminId && role === 'student') {
    return res.status(400).json({ message: 'Cannot demote your own account' });
  }

  try {
    const result = await sql`
      UPDATE users SET role = ${role} WHERE id = ${targetId} RETURNING id, username, role
    `;
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: `User ${result[0].username} is now ${role}`,
      user: result[0],
    });
  } catch (err) {
    console.error('Admin role change error:', err.message);
    res.status(500).json({ message: 'Server error changing role' });
  }
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS: Origin not allowed' });
  }

  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
