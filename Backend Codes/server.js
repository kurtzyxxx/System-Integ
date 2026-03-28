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
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve the uploads directory statically so frontend can fetch images
app.use('/uploads', express.static(uploadDir));

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Initialize Database Table
async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
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
    
    // Ensure the new column exists if the table was created in a previous step
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512)`;

    console.log('Database initialized (users and profiles tables checked/created)');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

initDb();

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({
      status: 'ok',
      message: 'Backend is running and connected to Supabase!',
      dbTime: result[0].now
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: err.message });
  }
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
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
      VALUES (${fullName}, ${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email
    `;

    // Initialize an empty profile for the new user
    await sql`
      INSERT INTO profiles (user_id) VALUES (${newUser[0].id})
    `;

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0]
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password, email } = req.body;
  const loginIdentifier = email || username;

  if (!loginIdentifier || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required' });
  }

  try {
    const isEmail = loginIdentifier.includes('@');
    
    let users;
    if (isEmail) {
       users = await sql`SELECT * FROM users WHERE email = ${loginIdentifier}`;
    } else {
       users = await sql`SELECT * FROM users WHERE username = ${loginIdentifier}`;
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
        fullName: user.full_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Change Password Endpoint
app.post('/api/auth/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
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
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// Update Name Endpoint
app.post('/api/auth/update-name', async (req, res) => {
  const { userId, newName } = req.body;

  if (!userId || !newName) {
    return res.status(400).json({ message: 'User ID and new name are required' });
  }

  try {
    const updatedUser = await sql`
      UPDATE users 
      SET full_name = ${newName} 
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
        fullName: updatedUser[0].full_name
      }
    });
  } catch (err) {
    console.error('Update name error:', err);
    res.status(500).json({ message: 'Server error while updating name' });
  }
});

// Get Profile Endpoint
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const profiles = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profiles[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update Profile Endpoint
app.post('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { bio, major, school } = req.body;
  
  try {
    const updatedProfile = await sql`
      INSERT INTO profiles (user_id, bio, major, school, updated_at)
      VALUES (${userId}, ${bio}, ${major}, ${school}, CURRENT_TIMESTAMP)
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
      profile: updatedProfile[0]
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Upload Avatar Endpoint
app.post('/api/profile/:userId/avatar', upload.single('avatar'), async (req, res) => {
  const { userId } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  try {
    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedProfile = await sql`
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
      avatarUrl: avatarUrl
    });

  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
