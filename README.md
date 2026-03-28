# Study Planner - Web Application

A full-stack web-based Study Planner application built with React (TypeScript) frontend and Node.js/Express backend with Supabase database.

## Features

- User Authentication (Register/Login)
- Study Task Management (CRUD operations)
- Profile Management with Photo Upload
- Password Change functionality
- Responsive modern UI

## Project Structure

```
System-Integ/
├── backend/              ← Active backend (run from root)
├── Backend Codes/        ← Backup/reference copy
├── Frontend Codes/       ← React TypeScript frontend
└── package.json          ← Root scripts for running the app
```

## Tech Stack

- **Frontend:** React, TypeScript, Axios
- **Backend:** Node.js, Express.js, Multer
- **Database:** Supabase (PostgreSQL)

## Setup (Mac & Windows)

### Prerequisites
- Node.js v16+ installed
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

Make sure the `backend/.env` file exists with:
```
PORT=5000
DATABASE_URL=your_supabase_connection_string
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
