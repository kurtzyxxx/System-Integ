# Study Planner - Web Application

A full-stack web-based Study Planner application built with React (TypeScript) frontend and Node.js/Express backend with Supabase database.

## Features

- User Authentication (Register/Login)
- Study Task Management (CRUD operations) with priority levels
- Subject Management with color coding
- Profile Management with Photo Upload
- Password Change functionality
- Responsive modern dark UI
- Task filtering (All / Pending / Done)

## Project Structure

```
System-Integ/
├── backend/              ← Active backend (Node.js/Express)
│   ├── server.js         ← Main API server
│   ├── db.js             ← Database connection (Supabase/PostgreSQL)
│   ├── .env              ← Environment variables (not committed)
│   └── package.json
├── Backend Codes/        ← Backup/reference copy
├── Frontend Codes/       ← React TypeScript frontend (source of truth)
│   └── src/
│       ├── pages/        ← Login, Register, Dashboard, Profile
│       └── services/     ← API service layer
├── src/                  ← Synced frontend code (for root build)
├── render.yaml           ← Render deployment blueprint
├── package.json          ← Root scripts for running the app
└── README.md
```

## Tech Stack

- **Frontend:** React, TypeScript, Axios, React Router
- **Backend:** Node.js, Express.js, Multer, Bcrypt
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Render (Backend) / Render or Vercel (Frontend)

## Setup (Mac & Windows)

### Prerequisites
- Node.js v18+ installed
- npm installed

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create the `backend/.env` file (see `.env.example`):
```
PORT=5001
DATABASE_URL=your_supabase_connection_string
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Setup Frontend
```bash
cd "Frontend Codes"
npm install
```

### 4. Running the App

**Start Backend** (from root):
```bash
npm run start:backend
```

**Start Frontend** (from root or `Frontend Codes/`):
```bash
# From root
cd "Frontend Codes" && npm start

# Or directly from Frontend Codes/
npm start
```

> ✅ Works on both **Mac/Linux** and **Windows** (CMD & PowerShell)

## Ports

| Service  | Port |
|----------|------|
| Backend  | 5001 |
| Frontend | 3000 |

> ⚠️ **macOS Note:** Port 5000 is reserved by Apple AirPlay. Always use port **5001** for the backend.

---

## Deployment

### Backend — Deploy to Render

1. **Push code to GitHub** (make sure `backend/` folder is committed)
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** `Node`
5. Add **Environment Variables** in Render dashboard:
   - `PORT` = `10000` (Render default)
   - `DATABASE_URL` = your Supabase connection string
   - `NODE_ENV` = `production`
   - `ALLOWED_ORIGINS` = your deployed frontend URL (e.g. `https://your-app.onrender.com`)
6. Click **Create Web Service** — Render will auto-deploy

> 💡 You can also use the included `render.yaml` for Blueprint deployment.

### Frontend — Deploy to Render (Static Site)

1. Go to [render.com](https://render.com) → **New → Static Site**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `.` (root, since `package.json` is at root)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Add **Environment Variable**:
   - `REACT_APP_BACKEND_URL` = your deployed backend URL (e.g. `https://study-planner-api.onrender.com`)
5. Click **Create Static Site**

### Frontend — Deploy to Vercel (Alternative)

1. Go to [vercel.com](https://vercel.com) → **Import Project**
2. Connect your GitHub repo
3. Set **Root Directory** to `.` (root)
4. Add **Environment Variable**:
   - `REACT_APP_BACKEND_URL` = your deployed backend URL
5. Deploy!

### After Deployment

- Update the backend's `ALLOWED_ORIGINS` env var to include your frontend URL
- Test the health endpoint: `https://your-backend-url.onrender.com/api/health`
- Verify login/register flow works end-to-end

## API Endpoints

| Method | Endpoint                        | Description           |
|--------|----------------------------------|-----------------------|
| GET    | `/api/health`                   | Health check          |
| POST   | `/api/auth/register`            | Register new user     |
| POST   | `/api/auth/login`               | Login                 |
| POST   | `/api/auth/change-password`     | Change password       |
| POST   | `/api/auth/update-name`         | Update display name   |
| GET    | `/api/profile/:userId`          | Get user profile      |
| POST   | `/api/profile/:userId`          | Update user profile   |
| POST   | `/api/profile/:userId/avatar`   | Upload avatar image   |
